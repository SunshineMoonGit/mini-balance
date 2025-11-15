"""add_account_description_and_balances

Revision ID: 9bfc4b6d88d6
Revises: 69574623e6aa
Create Date: 2025-11-16

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '9bfc4b6d88d6'
down_revision = '69574623e6aa'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('accounts', sa.Column('description', sa.String(length=500), nullable=True))

    op.create_table(
        'account_balances',
        sa.Column('account_id', sa.Integer(), nullable=False),
        sa.Column('total_debit', sa.Numeric(precision=15, scale=0), nullable=False, server_default='0'),
        sa.Column('total_credit', sa.Numeric(precision=15, scale=0), nullable=False, server_default='0'),
        sa.Column('balance', sa.Numeric(precision=15, scale=0), nullable=False, server_default='0'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('account_id')
    )

    # 초기 잔액 데이터 채우기 (삭제되지 않은 분개만 집계)
    op.execute(
        sa.text(
            """
            INSERT INTO account_balances (account_id, total_debit, total_credit, balance, updated_at)
            SELECT
                a.id,
                COALESCE(SUM(CASE WHEN je.is_deleted = 0 OR je.is_deleted IS NULL THEN jl.debit ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN je.is_deleted = 0 OR je.is_deleted IS NULL THEN jl.credit ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN je.is_deleted = 0 OR je.is_deleted IS NULL THEN jl.debit - jl.credit ELSE 0 END), 0),
                CURRENT_TIMESTAMP
            FROM accounts a
            LEFT JOIN journal_lines jl ON jl.account_id = a.id
            LEFT JOIN journal_entries je ON je.id = jl.entry_id
            GROUP BY a.id
            """
        )
    )


def downgrade() -> None:
    op.drop_table('account_balances')
    op.drop_column('accounts', 'description')
