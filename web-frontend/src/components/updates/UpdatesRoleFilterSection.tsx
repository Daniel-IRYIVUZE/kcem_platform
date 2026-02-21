import { Users } from 'lucide-react';

interface Role {
  id: string;
  label: string;
  icon: any;
}

interface UpdatesRoleFilterSectionProps {
  roles: Role[];
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const UpdatesRoleFilterSection = ({
  roles,
  selectedRole,
  onRoleChange
}: UpdatesRoleFilterSectionProps) => {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Users size={18} className="text-slate-600" />
        <span className="text-sm font-medium text-slate-700">Filter by Role:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              selectedRole === role.id
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {role.icon}
            {role.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default UpdatesRoleFilterSection;
