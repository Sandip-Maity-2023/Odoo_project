const AdminHeader = ({ employees, onSelectEmployee }) => {
    return (
        <div className="flex items-center gap-4 bg-purple-50 p-2 rounded-md">
            <span className="text-xs font-bold text-purple-800">Viewing As:</span>
            <select 
                onChange={(e) => onSelectEmployee(e.target.value)}
                aria-label="Viewing as"
                title="Viewing as"
                className="bg-white border text-sm rounded px-2 py-1 outline-none"
            >
                <option value="all">Company Overview</option>
                {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                        {emp.employeeId} - {emp.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
