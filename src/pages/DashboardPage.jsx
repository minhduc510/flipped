import { useLiveQuery } from "dexie-react-hooks";
import { Award, BookOpenCheck, Brain, CalendarDays } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../components/PageHeader";
import chaptersData from "../data/chapters.json";
import { db } from "../data/learningDb";
import { formatStudyDate } from "../utils/learning";

export default function DashboardPage() {
  const [now] = useState(() => Date.now());
  const snapshot = useLiveQuery(
    async () => {
      const [cards, reviews, quizzes, clozes, listening, progress] =
        await Promise.all([
          db.flashcards.toArray(),
          db.reviewHistory.toArray(),
          db.quizAttempts.toArray(),
          db.clozeAttempts.toArray(),
          db.listeningProgress.toArray(),
          db.chapterProgress.toArray(),
        ]);
      return { cards, reviews, quizzes, clozes, listening, progress };
    },
    [],
    {
      cards: [],
      reviews: [],
      quizzes: [],
      clozes: [],
      listening: [],
      progress: [],
    },
  );

  const completedChapters = snapshot.progress.filter(
    (item) => item.completedAt,
  ).length;
  const masteredCards = snapshot.cards.filter(
    (item) => item.status === "mastered",
  ).length;
  const dueCards = snapshot.cards.filter((item) => item.dueAt <= now).length;
  const averageQuiz = snapshot.quizzes.length
    ? Math.round(
        snapshot.quizzes.reduce((sum, item) => sum + item.percentage, 0) /
          snapshot.quizzes.length,
      )
    : 0;
  const latestActivity = Math.max(
    0,
    ...snapshot.reviews.map((item) => item.reviewedAt),
    ...snapshot.quizzes.map((item) => item.completedAt),
    ...snapshot.clozes.map((item) => item.completedAt),
    ...snapshot.listening.map((item) => item.updatedAt),
  );

  const chartData = chaptersData.chapters.map((chapter) => {
    const quizzes = snapshot.quizzes.filter(
      (item) => item.chapterNum === chapter.chapterNum,
    );
    const clozes = snapshot.clozes.filter(
      (item) => item.chapterNum === chapter.chapterNum,
    );
    return {
      chapter: `C${chapter.chapterNum}`,
      quiz: quizzes.length
        ? Math.round(
            quizzes.reduce((sum, item) => sum + item.percentage, 0) /
              quizzes.length,
          )
        : 0,
      cloze: clozes.length
        ? Math.round(
            clozes.reduce((sum, item) => sum + item.percentage, 0) /
              clozes.length,
          )
        : 0,
    };
  });

  return (
    <section className="feature-page">
      <Helmet>
        <title>Dashboard Tiến Độ Học Tập | Flipped Song Ngữ</title>
        <meta
          name="description"
          content="Theo dõi tiến trình đọc sách Flipped song ngữ, số lượng từ vựng đã nắm vững, kết quả luyện tập trắc nghiệm và chép chính tả."
        />
        <meta property="og:title" content="Dashboard Tiến Độ Học Tập | Flipped Song Ngữ" />
        <meta
          property="og:description"
          content="Theo dõi tiến trình đọc sách Flipped song ngữ, số lượng từ vựng đã nắm vững, kết quả luyện tập trắc nghiệm và chép chính tả."
        />
        <meta property="og:image" content={`${import.meta.env.VITE_SITE_URL}/cover.jpg`} />
        <meta property="og:url" content={`${import.meta.env.VITE_SITE_URL}/dashboard`} />
      </Helmet>
      <PageHeader
        eyebrow="Learning analytics"
        title="Dashboard tiến độ"
        description="Tổng hợp dữ liệu được lưu ngay trên thiết bị này. Không cần tài khoản hay kết nối máy chủ."
      />

      <div className="dashboard-grid">
        <article className="metric-card">
          <BookOpenCheck />
          <div>
            <strong>{completedChapters}/14</strong>
            <span>Chương đã đọc</span>
          </div>
        </article>
        <article className="metric-card">
          <Brain />
          <div>
            <strong>{masteredCards}</strong>
            <span>Từ đã vững</span>
          </div>
        </article>
        <article className="metric-card">
          <Award />
          <div>
            <strong>{averageQuiz}%</strong>
            <span>Điểm quiz trung bình</span>
          </div>
        </article>
        <article className="metric-card">
          <CalendarDays />
          <div>
            <strong>{dueCards}</strong>
            <span>Thẻ cần ôn hôm nay</span>
          </div>
        </article>
      </div>

      <div className="dashboard-panels">
        <article className="chart-card">
          <div className="panel-heading">
            <div>
              <h2>Kết quả theo chương</h2>
              <p>So sánh điểm Quiz và Cloze trung bình.</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="chapter" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar
                  dataKey="quiz"
                  name="Quiz"
                  fill="#3b82f6"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="cloze"
                  name="Cloze"
                  fill="#f59e0b"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="activity-card">
          <h2>Tổng quan hoạt động</h2>
          <dl>
            <div>
              <dt>Lượt ôn SRS</dt>
              <dd>{snapshot.reviews.length}</dd>
            </div>
            <div>
              <dt>Bài quiz đã làm</dt>
              <dd>{snapshot.quizzes.length}</dd>
            </div>
            <div>
              <dt>Bài cloze đã làm</dt>
              <dd>{snapshot.clozes.length}</dd>
            </div>
            <div>
              <dt>Đoạn đã nghe</dt>
              <dd>
                {snapshot.listening.filter((item) => item.completed).length}
              </dd>
            </div>
            <div>
              <dt>Hoạt động gần nhất</dt>
              <dd>{formatStudyDate(latestActivity)}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
