import django, os
os.environ['DJANGO_SETTINGS_MODULE'] = 'ecclesia.settings.railway'
django.setup()

from ecclesia.apps.members.models import Member, Family
from ecclesia.apps.ministries.models import Ministry
from ecclesia.apps.visitors.models import Visitor
from ecclesia.apps.cells.models import Cell
import datetime

# Skip if data already exists
if Member.objects.count() > 0:
    print(f'Data already exists: {Member.objects.count()} members')
    exit(0)

f = Family.objects.create(name='Familia Silva', city='Sao Paulo', state='SP')

names = ['Ana Silva','Joao Santos','Maria Oliveira','Pedro Costa','Lucia Ferreira','Carlos Lima','Julia Almeida','Rafael Souza']
statuses = ['visitor','decided','member','leader']
members = []
for i, n in enumerate(names):
    m = Member.objects.create(
        full_name=n,
        phone=f'1198888{i:04d}',
        spiritual_status=statuses[i%4],
        family=f
    )
    members.append(m)

Ministry.objects.create(name='Louvor', slug='louvor', category='worship')
Ministry.objects.create(name='Infantil', slug='infantil', category='children')
Ministry.objects.create(name='Jovens', slug='jovens', category='youth')

Visitor.objects.create(full_name='Marcos Visitante', visit_date=datetime.date.today(), follow_up_stage='new')
Visitor.objects.create(full_name='Paula Curiosa', visit_date=datetime.date.today(), follow_up_stage='cell_invited')
Visitor.objects.create(full_name='Roberto Interessado', visit_date=datetime.date.today(), follow_up_stage='converted')

Cell.objects.create(name='Celula Central', leader=members[0], day_of_week='wednesday')

print(f'Seed OK: {Member.objects.count()} membros, {Ministry.objects.count()} ministerios, {Visitor.objects.count()} visitantes, {Cell.objects.count()} celulas')
