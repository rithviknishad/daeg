# Generated by Django 4.0.2 on 2022-03-16 06:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mgems', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='prosumerenergyconsumptionsystem',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='prosumerenergyconsumptionsystem',
            name='deleted',
        ),
        migrations.RemoveField(
            model_name='prosumerenergyconsumptionsystem',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='prosumerenergygenerationsystem',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='prosumerenergygenerationsystem',
            name='deleted',
        ),
        migrations.RemoveField(
            model_name='prosumerenergygenerationsystem',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='prosumerenergystoragesystem',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='prosumerenergystoragesystem',
            name='deleted',
        ),
        migrations.RemoveField(
            model_name='prosumerenergystoragesystem',
            name='updated_at',
        ),
        migrations.AlterField(
            model_name='prosumerenergyconsumptionsystem',
            name='prosumer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='consumptions', to='mgems.prosumer'),
        ),
        migrations.AlterField(
            model_name='prosumerenergygenerationsystem',
            name='prosumer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='generations', to='mgems.prosumer'),
        ),
        migrations.AlterField(
            model_name='prosumerenergystoragesystem',
            name='prosumer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='storages', to='mgems.prosumer'),
        ),
    ]