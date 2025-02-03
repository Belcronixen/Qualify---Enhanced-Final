import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Clock, Award, BrainCircuit, Heart, Globe, 
  GraduationCap, Briefcase, MapPin, UserCheck, AlertTriangle,
  Calendar, School
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { QuestionnaireUser } from './types';

interface DashboardSummaryProps {
  users: QuestionnaireUser[];
}

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ReactNode;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}

function StatCard({ title, value, icon, description, trend, color = 'neutral' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border border-${color}-200 bg-white p-6`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg bg-${color}-100 p-2`}>{icon}</div>
          </div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-neutral-900">{value}</div>
            {trend && (
              <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </div>
            )}
          </div>
          {description && <p className="text-sm text-neutral-500">{description}</p>}
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardSummary({ users }: DashboardSummaryProps) {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.responses && u.responses.length > 0).length;
  const completionRate = totalUsers ? (activeUsers / totalUsers) * 100 : 0;

  const completionTimes = users.map(u => u.completion_time).filter((t): t is number => t !== null);
  const averageTime = completionTimes.length ? Math.floor(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length) : 0;
  const minutes = Math.floor(averageTime / 60), seconds = averageTime % 60;

  const educationLevels = users.reduce((acc, user) => {
    acc[user.education_level] = (acc[user.education_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topEducation = Object.entries(educationLevels).sort((a, b) => b[1] - a[1])[0];

  const roles = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topRole = Object.entries(roles).sort((a, b) => b[1] - a[1])[0];

  const countries = users.reduce((acc, user) => {
    const cc = user.country_code.replace('+', '').toLowerCase();
    acc[cc] = (acc[cc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCountry = Object.entries(countries).sort((a, b) => b[1] - a[1])[0];

  const averageAge = totalUsers ? Math.round(users.reduce((sum, user) => sum + parseInt(user.age), 0) / totalUsers) : 0;

  const categoryAverages = users.reduce((acc, user) => {
    if (user.categoryScores) {
      Object.entries(user.categoryScores).forEach(([cat, scores]) => {
        if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
        acc[cat].total += scores.percentage;
        acc[cat].count++;
      });
    }
    return acc;
  }, {} as Record<string, { total: number; count: number }>);
  const avgCompetencia = categoryAverages['Competencia Tecnológica Básica']
    ? (categoryAverages['Competencia Tecnológica Básica'].total / categoryAverages['Competencia Tecnológica Básica'].count).toFixed(2)
    : '0';
  const avgResolucion = categoryAverages['Resolución de Problemas y Pensamiento Crítico']
    ? (categoryAverages['Resolución de Problemas y Pensamiento Crítico'].total / categoryAverages['Resolución de Problemas y Pensamiento Crítico'].count).toFixed(2)
    : '0';
  const avgEstado = categoryAverages['Estado Personal y Recursos']
    ? (categoryAverages['Estado Personal y Recursos'].total / categoryAverages['Estado Personal y Recursos'].count).toFixed(2)
    : '0';

  const usersWithDespair = users.filter(user => user.despairLevel?.score !== undefined);
  const averageDespairScore = usersWithDespair.length
    ? usersWithDespair.reduce((sum, user) => sum + (user.despairLevel?.score || 0), 0) / usersWithDespair.length
    : 0;
  const averageDespairPercentage = averageDespairScore * 100;

  const despairLevels = users.reduce((acc, user) => {
    if (user.despairLevel?.level) {
      acc[user.despairLevel.level] = (acc[user.despairLevel.level] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const getDespairDescription = () => {
    const parts = [];
    if (despairLevels.high) parts.push(`${despairLevels.high} alto`);
    if (despairLevels.medium) parts.push(`${despairLevels.medium} medio`);
    if (despairLevels.low) parts.push(`${despairLevels.low} bajo`);
    if (despairLevels.none) parts.push(`${despairLevels.none} sin desesperación`);
    return parts.join(', ');
  };

  const applicantsToday = users.filter(u => new Date(u.created_at).toDateString() === new Date().toDateString()).length;
  const pendingEvaluations = users.filter(u => u.responses?.some(r => r.score === null)).length;
  const seniorPercentage = totalUsers ? ((users.filter(u => u.experience_level === 'senior').length / totalUsers) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Aplicantes"
          value={totalUsers}
          icon={<Users className="h-5 w-5 text-neutral-700" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Tasa de Finalización"
          value={`${completionRate.toFixed(1)}%`}
          icon={<UserCheck className="h-5 w-5 text-neutral-700" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Tiempo Promedio"
          value={`${minutes}:${seconds.toString().padStart(2, '0')}`}
          icon={<Clock className="h-5 w-5 text-neutral-700" />}
          description="Duración promedio del cuestionario"
        />
        <StatCard
          title="Edad Promedio"
          value={averageAge}
          icon={<Users className="h-5 w-5 text-neutral-700" />}
          description="Años"
        />
      </div>

      {/* Category Performance */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Competencia Técnica"
          value={`${avgCompetencia}%`}
          icon={<BrainCircuit className="h-5 w-5 text-blue-700" />}
          color="blue"
        />
        <StatCard
          title="Resolución de Problemas"
          value={`${avgResolucion}%`}
          icon={<Award className="h-5 w-5 text-green-700" />}
          color="green"
        />
        <StatCard
          title="Estado Personal"
          value={`${avgEstado}%`}
          icon={<Heart className="h-5 w-5 text-purple-700" />}
          color="purple"
        />
      </div>

      {/* Demographics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Nivel Educativo Principal"
          value={topEducation?.[0] || 'N/A'}
          icon={<GraduationCap className="h-5 w-5 text-neutral-700" />}
          description={`${topEducation?.[1] || 0} aplicantes`}
        />
        <StatCard
          title="Puesto Más Solicitado"
          value={topRole?.[0] || 'N/A'}
          icon={<Briefcase className="h-5 w-5 text-neutral-700" />}
          description={`${topRole?.[1] || 0} aplicantes`}
        />
        <StatCard
          title="País Principal"
          value={topCountry ? (
            <div className="flex items-center">
              <div className="relative flex h-6 items-center">
                <PhoneInput
                  country={topCountry[0]}
                  value={topCountry[0]}
                  disabled
                  containerClass="!inline-block"
                  inputClass="!hidden"
                  buttonClass="!w-[30px] !h-[20px] !border-0 !p-0 !bg-transparent"
                />
              </div>
            </div>
          ) : 'N/A'}
          icon={<MapPin className="h-5 w-5 text-neutral-700" />}
          description={topCountry ? `${topCountry[1]} aplicantes` : undefined}
        />
        <StatCard
          title="Nivel de Desesperación"
          value={`${averageDespairPercentage.toFixed(1)}%`}
          icon={<AlertTriangle className="h-5 w-5 text-red-700" />}
          description={getDespairDescription()}
          color="red"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Aplicantes Hoy"
          value={applicantsToday}
          icon={<Calendar className="h-5 w-5 text-neutral-700" />}
        />
        <StatCard
          title="Evaluaciones Pendientes"
          value={pendingEvaluations}
          icon={<Clock className="h-5 w-5 text-neutral-700" />}
        />
        <StatCard
          title="Experiencia Senior"
          value={`${seniorPercentage}%`}
          icon={<School className="h-5 w-5 text-neutral-700" />}
          description="Del total de aplicantes"
        />
      </div>
    </div>
  );
}
