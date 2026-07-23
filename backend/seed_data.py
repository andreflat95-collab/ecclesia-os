import django, os
os.environ['DJANGO_SETTINGS_MODULE'] = 'ecclesia.settings.railway'
django.setup()

from ecclesia.apps.members.models import Member, Family
from ecclesia.apps.ministries.models import Ministry
from ecclesia.apps.visitors.models import Visitor
from ecclesia.apps.cells.models import Cell
from ecclesia.apps.events.models import Event
from django.utils import timezone
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

louvor = Ministry.objects.create(name='Louvor', slug='louvor', category='worship')
infantil = Ministry.objects.create(name='Infantil', slug='infantil', category='children')
jovens = Ministry.objects.create(name='Jovens', slug='jovens', category='youth')

Visitor.objects.create(full_name='Marcos Visitante', visit_date=datetime.date.today(), follow_up_stage='new')
Visitor.objects.create(full_name='Paula Curiosa', visit_date=datetime.date.today(), follow_up_stage='cell_invited')
Visitor.objects.create(full_name='Roberto Interessado', visit_date=datetime.date.today(), follow_up_stage='converted')

Cell.objects.create(name='Celula Central', leader=members[0], day_of_week='wednesday')

# ── Eventos de exemplo ──
today = datetime.date.today()
Event.objects.create(
    title='Reunião de Oração de Mulheres', slug='oracao-mulheres',
    event_type='women', recurrence='weekly',
    start_date=timezone.make_aware(datetime.datetime.combine(today + datetime.timedelta(days=(1-today.weekday())%7), datetime.time(15,0))),
    location='Templo Principal',
    address='Av. Dep. Cristovam Chiaradia, 922 - Buritis',
    contact_name='Pra. Lillian', contact_phone='31988887777',
    description='Toda terça-feira às 15h. Venha participar deste momento especial de oração!',
    is_featured=True,
)
Event.objects.create(
    title='Culto de Domingo', slug='culto-domingo',
    event_type='service', recurrence='weekly',
    start_date=timezone.make_aware(datetime.datetime.combine(today + datetime.timedelta(days=(6-today.weekday())%7), datetime.time(19,0))),
    location='Templo Principal',
    address='Av. Dep. Cristovam Chiaradia, 922 - Buritis',
    description='Culto de adoração e palavra. Todos são bem-vindos!',
    is_featured=True,
)
Event.objects.create(
    title='Ensaio do Louvor', slug='ensaio-louvor',
    event_type='other', recurrence='weekly',
    start_date=timezone.make_aware(datetime.datetime.combine(today + datetime.timedelta(days=(4-today.weekday())%7), datetime.time(20,0))),
    location='Templo Principal', ministry=louvor,
    description='Ensaio semanal da equipe de louvor.',
)
Event.objects.create(
    title='Conferência de Jovens', slug='conf-jovens',
    event_type='youth', recurrence='none',
    start_date=timezone.make_aware(datetime.datetime.combine(today + datetime.timedelta(days=14), datetime.time(18,0))),
    end_date=timezone.make_aware(datetime.datetime.combine(today + datetime.timedelta(days=14), datetime.time(22,0))),
    location='Templo Principal', ministry=jovens,
    description='Grande conferência com a juventude! Louvor, palavra e comunhão.',
    is_featured=True,
)

print(f'Seed OK: {Member.objects.count()} membros, {Ministry.objects.count()} ministerios, {Visitor.objects.count()} visitantes, {Cell.objects.count()} celulas, {Event.objects.count()} eventos')
