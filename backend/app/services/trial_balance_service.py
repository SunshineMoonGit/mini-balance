"""
시산표(Trial Balance) Service

합계 시산표(A 방식): 차변 합계 + 대변 합계 + 잔액
"""
from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.repositories.trial_balance_repo import TrialBalanceRepository
from app.schemas.trial_balance_schema import (
    BalanceAmount,
    CurrentPeriod,
    RecentEntry,
    TrialBalancePeriod,
    TrialBalanceResponse,
    TrialBalanceRow,
    TrialBalanceTotal,
)
from app.core.exceptions import validate_date_range


class TrialBalanceService:
    """
    시산표 서비스

    지정된 기간 동안의 계정별 차변/대변 합계 및 잔액을 계산합니다.
    """

    def __init__(self, db: Session):
        """
        Args:
            db: 데이터베이스 세션
        """
        self.db = db
        self.repo = TrialBalanceRepository(db)

    def get_trial_balance(
        self,
        from_date: date,
        to_date: date
    ) -> TrialBalanceResponse:
        """
        시산표 조회

        지정된 기간의 활성 계정에 대해 차변/대변 합계 및 잔액을 계산합니다.

        Args:
            from_date: 시작일
            to_date: 종료일

        Returns:
            시산표 응답 (A 방식: 합계 시산표)

        Raises:
            HTTPException(422): 날짜 범위가 유효하지 않은 경우
        """
        # 날짜 범위 검증
        validate_date_range(from_date, to_date)

        # Repository에서 계정별 데이터 조회
        account_entries = self.repo.calculate_trial_balance(from_date, to_date)
        account_ids = [entry.account_id for entry in account_entries]
        opening_totals = self.repo.calculate_totals_before_period(account_ids, from_date)

        rows: list[TrialBalanceRow] = []
        total_balance_debit = Decimal("0")
        total_balance_credit = Decimal("0")

        for data in account_entries:
            total_debit = data.total_debit
            total_credit = data.total_credit
            opening_debit, opening_credit = opening_totals.get(data.account_id, (Decimal("0"), Decimal("0")))
            opening_balance_value = opening_debit - opening_credit
            current_balance_value = total_debit - total_credit
            ending_balance_value = opening_balance_value + current_balance_value

            opening_amount, opening_direction = self._convert_balance(
                opening_balance_value, data.type
            )
            ending_amount, ending_direction = self._convert_balance(
                ending_balance_value, data.type
            )

            if ending_direction == "DEBIT":
                total_balance_debit += ending_amount
            else:
                total_balance_credit += ending_amount

            # 시산표 행 생성
            row = TrialBalanceRow(
                account_id=data.account_id,
                account_code=data.account_code,
                account_name=data.account_name,
                type=data.type,
                total_debit=total_debit,
                total_credit=total_credit,
                opening_balance=BalanceAmount(
                    amount=opening_amount,
                    direction=opening_direction,
                ),
                current=CurrentPeriod(
                    debit=total_debit,
                    credit=total_credit,
                ),
                ending_balance=BalanceAmount(
                    amount=ending_amount,
                    direction=ending_direction,
                ),
                transaction_count=data.transaction_count,
                recent_entries=[
                    RecentEntry(
                        date=entry.date,
                        description=entry.description,
                        debit=entry.debit,
                        credit=entry.credit,
                    )
                    for entry in data.recent_entries
                ],
            )
            rows.append(row)

        # 기간 정보
        period = TrialBalancePeriod(
            from_date=from_date,
            to_date=to_date
        )

        # 합계 정보
        total = TrialBalanceTotal(
            debit=total_balance_debit,
            credit=total_balance_credit,
            is_balanced=(total_balance_debit == total_balance_credit)
        )

        return TrialBalanceResponse(
            period=period,
            rows=rows,
            total=total
        )

    def _convert_balance(
        self,
        balance: Decimal,
        account_type
    ) -> tuple[Decimal, str]:
        """
        잔액을 (금액, 방향) 형태로 변환

        Args:
            balance: 잔액 (양수: 차변, 음수: 대변)
            account_type: 계정 타입

        Returns:
            (절대값 금액, 방향)
            방향: "DEBIT" 또는 "CREDIT"
        """
        amount = abs(balance)

        # 정상 잔액 방향
        normal_direction = self.repo.get_normal_balance_direction(account_type)

        # 잔액이 양수면 차변, 음수면 대변
        if balance >= 0:
            direction = "DEBIT"
        else:
            direction = "CREDIT"

        # 잔액이 0이면 정상 방향 사용
        if balance == 0:
            direction = normal_direction

        return amount, direction
