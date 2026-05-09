import { Pill } from 'lucide-react';

export default function PrescriptionsTab({ prescriptions }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-xl mr-4">
          <Pill size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Prescriptions</h2>
          <p className="text-slate-500 text-sm">Medications prescribed by your doctors</p>
        </div>
      </div>
      
      <div className="divide-y divide-slate-100">
        {!prescriptions || prescriptions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
              <Pill size={32} />
            </div>
            <p className="text-slate-500 font-medium">No prescriptions found.</p>
          </div>
        ) : (
          prescriptions.map(pres => (
            <div key={pres._id} className="p-6 md:p-8 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{pres.doctor?.name}</h3>
                  <p className="text-sm text-slate-500">{pres.doctor?.specialty} • {new Date(pres.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                    {pres.medicines.length} Medicines
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {pres.medicines.map((med, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <p className="text-sm text-slate-500">{med.duration}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-slate-700 font-medium text-sm">
                      {med.dosage}
                    </div>
                  </div>
                ))}
              </div>

              {pres.notes && (
                <div className="mt-6 bg-yellow-50 text-yellow-800 p-4 rounded-2xl border border-yellow-100 text-sm">
                  <span className="font-bold">Doctor's Notes: </span> {pres.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
