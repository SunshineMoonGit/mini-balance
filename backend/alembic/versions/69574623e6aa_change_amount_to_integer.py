"""change_amount_to_integer

Revision ID: 69574623e6aa
Revises: f2df6c360a94
Create Date: 2025-11-14

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '69574623e6aa'
down_revision = 'f2df6c360a94'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # SQLite does not support ALTER COLUMN, use batch mode to recreate table
    with op.batch_alter_table('journal_lines', schema=None) as batch_op:
        batch_op.alter_column('debit',
                   existing_type=sa.NUMERIC(precision=15, scale=2),
                   type_=sa.Numeric(precision=15, scale=0),
                   existing_nullable=False)
        batch_op.alter_column('credit',
                   existing_type=sa.NUMERIC(precision=15, scale=2),
                   type_=sa.Numeric(precision=15, scale=0),
                   existing_nullable=False)


def downgrade() -> None:
    # SQLite does not support ALTER COLUMN, use batch mode to recreate table
    with op.batch_alter_table('journal_lines', schema=None) as batch_op:
        batch_op.alter_column('credit',
                   existing_type=sa.Numeric(precision=15, scale=0),
                   type_=sa.NUMERIC(precision=15, scale=2),
                   existing_nullable=False)
        batch_op.alter_column('debit',
                   existing_type=sa.Numeric(precision=15, scale=0),
                   type_=sa.NUMERIC(precision=15, scale=2),
                   existing_nullable=False)
