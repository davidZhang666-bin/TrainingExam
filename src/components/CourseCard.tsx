import { ArrowUpRight, Clock3, Star, BookOpen, Bookmark } from 'lucide-react';
import { type Course, courseMinutes } from '../domain';
import { CourseArt } from './Artwork';
import { useLearning } from '../store';
export default function CourseCard({
  course,
  onOpen,
}: {
  course: Course;
  onOpen: (id: string) => void;
}) {
  const { state, toggleFavorite } = useLearning();
  const saved = state.favorites.includes(course.id);
  return (
    <article className="panel course-card">
      <button
        className={'favorite-button ' + (saved ? 'saved' : '')}
        aria-label={(saved ? '取消收藏' : '收藏') + course.title}
        aria-pressed={saved}
        onClick={() => toggleFavorite(course.id)}
      >
        <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <button
        className={`course-cover ${course.color}`}
        onClick={() => onOpen(course.id)}
        aria-label={`查看${course.title}`}
      >
        <span className="cover-category">{course.category}</span>
        <CourseArt kind={course.art} />
        <span className="cover-caption">EXPLORE SOMETHING NEW</span>
        <span className="cover-number">
          0{['design', 'data', 'communication', 'security'].indexOf(course.id) + 1}
        </span>
      </button>
      <div className="course-info">
        <div className="course-tags">
          <span className="tag">{course.level}</span>
          <span className="course-rating">
            <Star size={11} fill="currentColor" />
            {course.rating}
          </span>
        </div>
        <button className="course-title" onClick={() => onOpen(course.id)}>
          <h3>{course.title}</h3>
          <ArrowUpRight size={15} />
        </button>
        <p className="course-subtitle">{course.subtitle}</p>
        <div className="course-meta">
          <span>
            <BookOpen size={11} />
            {course.lessons.length} 个章节
          </span>
          <span>
            <Clock3 size={11} />
            {courseMinutes(course)} 分钟
          </span>
        </div>
        <div className="course-teacher">
          <span className={`teacher-avatar ${course.color}`}>{course.instructor.slice(-2)}</span>
          <span>
            {course.instructor}
            <small>{course.role}</small>
          </span>
          <span className="student-count">{(course.students / 1000).toFixed(1)}k 人已学习</span>
        </div>
      </div>
    </article>
  );
}
