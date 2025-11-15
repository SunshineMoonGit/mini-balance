"""
분개(Journal Entry) Repository

데이터베이스 접근 로직을 담당합니다.
"""
from datetime import date
from decimal import Decimal

from sqlalchemy import String, func
from sqlalchemy.orm import Session, selectinload

from app.models.journal_entry import JournalEntry
from app.models.journal_line import JournalLine
from app.schemas.journal_schema import JournalEntryCreate, JournalEntryUpdate


class JournalRepository:
    """
    분개 Repository

    분개 데이터의 CRUD 및 집계 쿼리를 담당합니다.
    """

    def __init__(self, db: Session):
        """
        Args:
            db: 데이터베이스 세션
        """
        self.db = db

    def list_entries(
        self,
        from_date: date | None = None,
        to_date: date | None = None,
        limit: int = 50,
        offset: int = 0,
        include_deleted: bool = False
    ) -> list[JournalEntry]:
        """
        분개 목록 조회

        Args:
            from_date: 시작일
            to_date: 종료일
            limit: 조회 건수 제한
            include_deleted: 삭제된 분개 포함 여부

        Returns:
            분개 목록 (최신순)
        """
        query = self.db.query(JournalEntry)

        # 삭제되지 않은 분개만 조회 (기본)
        if not include_deleted:
            query = query.filter(JournalEntry.is_deleted == False)

        # 날짜 필터링
        if from_date:
            query = query.filter(JournalEntry.date >= from_date)
        if to_date:
            query = query.filter(JournalEntry.date <= to_date)

        # 라인과 계정 정보 함께 로드
        query = query.options(
            selectinload(JournalEntry.lines).selectinload(JournalLine.account)
        )

        # 최신순 정렬
        query = query.order_by(
            JournalEntry.date.desc(),
            JournalEntry.id.desc()
        )

        if offset:
            query = query.offset(offset)
        return query.limit(limit).all()

    def get_by_id(self, entry_id: int, include_deleted: bool = False) -> JournalEntry | None:
        """
        분개 단건 조회

        Args:
            entry_id: 분개 ID
            include_deleted: 삭제된 분개 포함 여부

        Returns:
            분개 객체
        """
        query = self.db.query(JournalEntry).filter(JournalEntry.id == entry_id)

        if not include_deleted:
            query = query.filter(JournalEntry.is_deleted == False)

        query = query.options(
            selectinload(JournalEntry.lines).selectinload(JournalLine.account)
        )

        return query.first()

    def create_entry(self, payload: JournalEntryCreate) -> JournalEntry:
        """
        분개 생성

        Args:
            payload: 분개 생성 데이터

        Returns:
            생성된 분개
        """
        # 분개 헤더 생성
        entry = JournalEntry(
            date=payload.date,
            description=payload.description
        )

        # 분개 라인 추가
        for line in payload.lines:
            entry.lines.append(
                JournalLine(
                    account_id=line.account_id,
                    debit=line.debit,
                    credit=line.credit,
                )
            )

        self.db.add(entry)
        self.db.flush()
        self.db.refresh(entry)
        return entry

    def update_entry(self, entry: JournalEntry, payload: JournalEntryUpdate) -> JournalEntry:
        """
        분개 수정

        기존 라인들을 모두 삭제하고 새로 생성합니다.

        Args:
            entry: 수정할 분개
            payload: 수정 데이터

        Returns:
            수정된 분개
        """
        # 기본 필드 업데이트
        entry.date = payload.date
        entry.description = payload.description

        # 기존 라인 모두 삭제
        for line in entry.lines:
            self.db.delete(line)
        self.db.flush()

        # 새로운 라인 추가
        for line_data in payload.lines:
            new_line = JournalLine(
                entry_id=entry.id,
                account_id=line_data.account_id,
                debit=line_data.debit,
                credit=line_data.credit,
            )
            self.db.add(new_line)

        self.db.flush()
        self.db.refresh(entry)
        return entry

    def delete_entry(self, entry: JournalEntry) -> JournalEntry:
        """
        분개 삭제 (soft-delete)

        Args:
            entry: 삭제할 분개

        Returns:
            삭제된 분개
        """
        entry.is_deleted = True
        self.db.flush()
        self.db.refresh(entry)
        return entry

    def get_account_transactions(
        self,
        account_id: int,
        from_date: date,
        to_date: date,
        search: str | None = None,
    ) -> list[dict]:
        query = (
            self.db.query(
                JournalEntry.id.label("entry_id"),
                JournalEntry.date,
                JournalEntry.description,
                JournalLine.debit,
                JournalLine.credit,
            )
            .join(JournalLine, JournalLine.entry_id == JournalEntry.id)
            .filter(
                JournalLine.account_id == account_id,
                JournalEntry.is_deleted == False,
                JournalEntry.date >= from_date,
                JournalEntry.date <= to_date,
            )
            .order_by(JournalEntry.date, JournalEntry.id)
        )
        if search:
            like_value = f"%{search.strip().lower()}%"
            query = query.filter(
                JournalEntry.description.ilike(like_value)
                | func.cast(JournalEntry.id, String).ilike(like_value)
            )
        return [row._asdict() for row in query.all()]

    def get_summary_list(
        self,
        from_date: date | None = None,
        to_date: date | None = None,
        limit: int = 50
    ) -> list[dict]:
        """
        분개 목록 요약 조회 (차변/대변 총액 포함)

        Args:
            from_date: 시작일
            to_date: 종료일
            limit: 조회 건수 제한

        Returns:
            분개 요약 목록
        """
        # 서브쿼리: 각 분개의 차변/대변 총액 계산
        line_summary = (
            self.db.query(
                JournalLine.entry_id,
                func.sum(JournalLine.debit).label("debit_total"),
                func.sum(JournalLine.credit).label("credit_total"),
            )
            .group_by(JournalLine.entry_id)
            .subquery()
        )

        # 메인 쿼리
        query = (
            self.db.query(
                JournalEntry.id,
                JournalEntry.date,
                JournalEntry.description,
                line_summary.c.debit_total,
                line_summary.c.credit_total,
            )
            .join(line_summary, JournalEntry.id == line_summary.c.entry_id)
            .filter(JournalEntry.is_deleted == False)
        )

        # 날짜 필터링
        if from_date:
            query = query.filter(JournalEntry.date >= from_date)
        if to_date:
            query = query.filter(JournalEntry.date <= to_date)

        # 정렬
        query = query.order_by(
            JournalEntry.date.desc(),
            JournalEntry.id.desc()
        )

        results = query.limit(limit).all()

        # 딕셔너리로 변환
        return [
            {
                "id": r.id,
                "date": r.date,
                "description": r.description,
                "debit_total": r.debit_total or Decimal("0.00"),
                "credit_total": r.credit_total or Decimal("0.00"),
            }
            for r in results
        ]
