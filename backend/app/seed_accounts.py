"""
계정과목 초기 데이터 시드 스크립트

요구사항 명세서에 정의된 기본 계정들을 생성합니다.
"""
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.core.database import session_scope
from app.models.account import Account, AccountType


# 요구사항 명세서 FR-AC-01: 초기 계정 시드
DEFAULT_ACCOUNTS = [
    # 자산 (ASSET)
    ("101", "현금", AccountType.ASSET),
    ("102", "보통예금", AccountType.ASSET),

    # 부채 (LIABILITY)
    ("201", "매입채무", AccountType.LIABILITY),

    # 자본 (EQUITY)
    ("301", "자본금", AccountType.EQUITY),

    # 수익 (REVENUE)
    ("401", "매출", AccountType.REVENUE),

    # 비용 (EXPENSE)
    ("501", "급여", AccountType.EXPENSE),
    ("502", "임차료", AccountType.EXPENSE),
]


def seed_accounts():
    """
    기본 계정과목들을 데이터베이스에 생성합니다.

    이미 존재하는 계정 코드는 건너뜁니다.
    """
    with session_scope() as session:
        # 기존 계정 코드 확인
        existing_codes = {code for (code,) in session.query(Account.code).all()}

        created_count = 0
        for code, name, acc_type in DEFAULT_ACCOUNTS:
            if code in existing_codes:
                print(f"⏭️  계정 {code} ({name})는 이미 존재합니다.")
                continue

            account = Account(
                code=code,
                name=name,
                type=acc_type,
                is_active=True
            )
            session.add(account)
            print(f"✅ 계정 {code} ({name}) 생성 완료")
            created_count += 1

        print(f"\n총 {created_count}개의 계정이 생성되었습니다.")


if __name__ == "__main__":
    print("=" * 50)
    print("계정과목 초기 데이터 시드 시작")
    print("=" * 50)
    seed_accounts()
    print("\n시드 작업 완료!")
