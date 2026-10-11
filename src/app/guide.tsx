import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { MemoryChart } from '@/components/memory-chart';
import { Button, Card, Hint, Screen, SectionTitle, type IconName } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useColors } from '@/lib/theme';

// Ebbinghaus (1885): share of material retained ("savings") after a single learning session.
const WITHOUT_REVIEW = [
  { label: 'сразу', value: 100 },
  { label: '20 мин', value: 58 },
  { label: '1 день', value: 34 },
  { label: '6 дней', value: 25 },
  { label: 'месяц', value: 21 },
];

// Illustration only: each review brings memory back up and it then fades more slowly.
const WITH_REVIEW = [
  { label: 'сразу', value: 100 },
  { label: '1 день', value: 90 },
  { label: '1 нед.', value: 90 },
  { label: '2 нед.', value: 92 },
  { label: 'месяц', value: 95 },
];

function Paragraph({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={{ color: c.text, fontSize: 16, lineHeight: 24 }}>{children}</Text>;
}

function Bold({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontWeight: '700' }}>{children}</Text>;
}

function Point({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: c.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Ionicons name={icon} size={20} color={c.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: c.muted, fontSize: 15, lineHeight: 21 }}>{text}</Text>
      </View>
    </View>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: c.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ color: c.onPrimary, fontWeight: '800' }}>{n}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: c.muted, fontSize: 15, lineHeight: 21 }}>{text}</Text>
      </View>
    </View>
  );
}

export default function GuideScreen() {
  const c = useColors();
  const { items } = useStore();

  return (
    <Screen>
      <View style={{ gap: 8, marginBottom: 4 }}>
        <Text style={{ color: c.text, fontSize: 26, fontWeight: '800' }}>
          Что такое интервальное повторение?
        </Text>
        <Paragraph>
          Это способ запоминать надолго: выученное повторяют не всё подряд и не каждый день, а{' '}
          <Bold>через растущие промежутки времени</Bold> — через день, через 3 дня, через неделю, через
          месяц. Каждое повторение приходится как раз на момент, когда материал начинает забываться.
        </Paragraph>
      </View>

      <SectionTitle>Почему мы забываем</SectionTitle>
      <Card style={{ gap: 14 }}>
        <Paragraph>
          Ещё в 1885 году психолог Герман Эббингауз измерил, как быстро уходит из памяти выученное. Без
          повторения большая часть забывается в первые же сутки, а дальше остаётся совсем немного. Это
          называют <Bold>кривой забывания</Bold>.
        </Paragraph>
        <MemoryChart
          title="Без повторений"
          points={WITHOUT_REVIEW}
          color={c.chartForget}
          labelled={[2, 4]}
        />
        <MemoryChart
          title="С повторениями"
          points={WITH_REVIEW}
          color={c.chartRemember}
          labelled={[4]}
        />
        <Hint>
          Верхний график — данные опытов Эббингауза, нижний — схема того, как повторения удерживают
          память. Нажмите на столбик, чтобы увидеть значение.
        </Hint>
      </Card>

      <SectionTitle>В чём сила</SectionTitle>
      <Card style={{ gap: 16 }}>
        <Point
          icon="trending-up-outline"
          title="Каждое повторение укрепляет память"
          text="После повторения слово забывается медленнее, чем раньше. Поэтому следующий перерыв можно сделать длиннее."
        />
        <Point
          icon="time-outline"
          title="Меньше времени — больше результат"
          text="Вместо многочасовой зубрёжки — несколько минут в день. Повторять нужно только то, что пора повторить."
        />
        <Point
          icon="infinite-outline"
          title="Надолго, а не до экзамена"
          text="Зубрёжка за один вечер быстро выветривается. Распределённые повторения переводят слова в долговременную память."
        />
        <Point
          icon="bulb-outline"
          title="Вспоминать, а не перечитывать"
          text="Самое полезное повторение — попытаться вспомнить слово самому, прежде чем подсмотреть ответ."
        />
      </Card>

      <SectionTitle>Как пользоваться приложением</SectionTitle>
      <Card style={{ gap: 16 }}>
        <Step
          n={1}
          title="Добавьте блок слов"
          text="Нажмите «+» и укажите, что учите: например, «Слова 1–10». Можно сразу разбить большой список на блоки — по одному на день."
        />
        <Step
          n={2}
          title="Выучили — нажмите ✓"
          text="Блок появится во вкладке «Сегодня» в выбранный день. Как только выучите его, отметьте галочкой — с этого дня начнётся расписание повторений."
        />
        <Step
          n={3}
          title="Открывайте «Сегодня» каждый день"
          text="Там будет всё, что нужно повторить именно сегодня. Повторили блок — нажмите ✓, и он уйдёт на следующий, более длинный интервал."
        />
        <Step
          n={4}
          title="Смотрите план"
          text="Во вкладке «План» видно, что и когда предстоит повторять в ближайшие дни и недели."
        />
        <Step
          n={5}
          title="Настройте под себя"
          text="В «Настройках» можно поменять интервалы (по умолчанию 1, 3, 5, 7, 10, 14, 21, 30 и 60 дней) и включить ежедневное напоминание."
        />
      </Card>

      <SectionTitle>Советы</SectionTitle>
      <Card style={{ gap: 10 }}>
        <Paragraph>• Берите небольшие блоки — 10–20 слов. Так их легче выучить за один подход.</Paragraph>
        <Paragraph>
          • Повторяя, закройте перевод и попробуйте вспомнить. Не вспомнили — посмотрите и попробуйте ещё
          раз.
        </Paragraph>
        <Paragraph>
          • Пропустили день — не страшно. Просроченные блоки останутся в «Сегодня», просто повторите их,
          когда сможете.
        </Paragraph>
        <Paragraph>• Включите напоминание, чтобы повторения не забывались.</Paragraph>
      </Card>

      {items.length === 0 ? (
        <Button
          title="Добавить первый блок"
          icon="add-circle-outline"
          onPress={() => router.replace('/add')}
        />
      ) : (
        <Button title="Понятно" onPress={() => router.back()} />
      )}
    </Screen>
  );
}
