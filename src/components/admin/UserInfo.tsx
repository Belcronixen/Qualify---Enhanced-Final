import { Calendar, GraduationCap, Users, Clock, Phone, AlertTriangle } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import { QuestionnaireUser } from './types';

interface UserInfoProps {
  user: QuestionnaireUser;
}

const ROLE_COLORS: Record<string, string> = {
  'web-developer': 'bg-blue-100 text-blue-800',
  seo: 'bg-green-100 text-green-800',
  'marketing-strategist': 'bg-purple-100 text-purple-800',
  intern: 'bg-yellow-100 text-yellow-800',
  designer: 'bg-pink-100 text-pink-800',
};

const DESPAIR_COLORS: Record<string, string> = {
  none: 'bg-green-100 text-green-800',
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

const DESPAIR_LABELS: Record<string, string> = {
  none: 'Sin Desesperación',
  low: 'Desesperación Baja',
  medium: 'Desesperación Media',
  high: 'Desesperación Alta',
};

export function UserInfo({ user }: UserInfoProps) {
  const roleColor = ROLE_COLORS[user.role] || 'bg-neutral-100 text-neutral-800';
  const experienceBadgeColor =
    user.experience_level === 'senior'
      ? 'bg-indigo-100 text-indigo-800'
      : 'bg-orange-100 text-orange-800';
  const despairColor = user.despairLevel ? DESPAIR_COLORS[user.despairLevel.level] : 'bg-neutral-100 text-neutral-800';
  const formatTime = (sec: number | null) =>
    !sec ? 'No disponible' : `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  const cc = user.country_code.replace('+', '');
  const fullPhoneNumber = cc + user.phone_number;

  return (
    <div className="flex-1 space-y-4">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            {user.first_name} {user.last_name}
          </h2>
          <div className="flex gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColor}`}>
              {user.role}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${experienceBadgeColor}`}>
              {user.experience_level}
            </span>
            {user.despairLevel && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${despairColor}`}>
                <AlertTriangle className="h-3 w-3" />
                {DESPAIR_LABELS[user.despairLevel.level]}
                <span className="ml-1 opacity-75">({user.despairLevel.percentage.toFixed(2)}%)</span>
              </span>
            )}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-4">
          <p className="text-sm text-neutral-500">{user.email}</p>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-neutral-400" />
            <PhoneInput
              country={cc.toLowerCase()}
              value={fullPhoneNumber}
              disabled
              containerClass="!inline-block"
              inputClass="!w-[200px] !h-[24px] !text-sm !py-0 !pl-[24px] !pr-2 !border-0 !bg-transparent"
              buttonClass="!w-[20px] !h-[24px] !border-0 !bg-transparent"
              buttonStyle={{ padding: 0 }}
              inputStyle={{ margin: 0 }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <div>
            <p className="text-sm font-medium text-neutral-700">Información Personal</p>
            <p className="text-sm text-neutral-500">
              {user.age} años • {user.gender} • {user.civil_status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-neutral-400" />
          <div>
            <p className="text-sm font-medium text-neutral-700">Educación</p>
            <p className="text-sm text-neutral-500">
              {user.education_level} • {user.degree}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-neutral-400" />
          <div>
            <p className="text-sm font-medium text-neutral-700">Dependientes</p>
            <p className="text-sm text-neutral-500">
              {user.dependents} {parseInt(user.dependents) === 1 ? 'dependiente' : 'dependientes'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-neutral-400" />
          <div>
            <p className="text-sm font-medium text-neutral-700">Tiempo de Prueba</p>
            <p className="text-sm text-neutral-500">{formatTime(user.completion_time)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
