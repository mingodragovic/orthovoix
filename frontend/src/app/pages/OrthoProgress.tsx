// src/app/pages/OrthoProgress.tsx
import { useState } from "react";
import { Download, CheckCircle, Clock, Circle, TrendingUp, Users, Calendar } from "lucide-react";
import { Avatar } from "../components/common/Avatar";
import { patients, exercisesOrtho } from "../../data/mockData";

export function OrthoProgress() {
  const total = 10;
  const done = 6;
  const rate = Math.round((done / total) * 100);
  const [selected, setSelected] = useState(0);

  const patientStats = [
    { label: "Patients actifs", val: "8/12", color: "#4A90D9" },
    { label: "Taux complétion", val: "68%", color: "#48BB78" },
    { label: "Exercices/mois", val: "42", color: "#F5A623" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>Rapports & Progrès</h1>
        <p className="text-muted-foreground">Suivez la progression de vos patients</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {patientStats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-border/50">
            <div className="text-2xl font-bold" style={{ color: s.color, fontFamily: "Poppins, sans-serif" }}>{s.val}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50">
            <h3 className="text-sm font-semibold mb-3">Patients actifs</h3>
            <div className="space-y-1">
              {patients.filter((p) => p.statut === "Actif").map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
                    selected === i ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <Avatar initials={p.avatar} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.nom}</p>
                    <p className="text-xs text-muted-foreground">{p.age} ans</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${p.statut === "Actif" ? "bg-green-500" : "bg-gray-400"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <Avatar initials={patients[selected].avatar} size={56} />
              <div>
                <h3 className="text-lg font-semibold">{patients[selected].nom}</h3>
                <p className="text-sm text-muted-foreground">{patients[selected].age} ans • {patients[selected].statut}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm font-medium">{done}/{total}</div>
                <div className="text-xs text-muted-foreground">Exercices</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Assignés", val: total, color: "#4A90D9" },
                { label: "Terminés", val: done, color: "#48BB78" },
                { label: "Taux", val: `${rate}%`, color: "#F5A623" },
              ].map((s) => (
                <div key={s.label} className="bg-muted/30 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold" style={{ color: s.color, fontFamily: "Poppins, sans-serif" }}>{s.val}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Exercises Table */}
            <h4 className="text-sm font-semibold mb-3">Détail des exercices</h4>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-4 text-xs font-semibold text-muted-foreground px-4 py-2.5 border-b border-border bg-muted/30 rounded-t-xl">
                  <span className="col-span-2">Exercice</span>
                  <span>Assigné</span>
                  <span className="text-right">Statut</span>
                </div>
                {exercisesOrtho.map((ex) => (
                  <div key={ex.id} className="grid grid-cols-4 items-center px-4 py-3 border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                    <div className="col-span-2 min-w-0">
                      <p className="text-sm font-medium truncate">{ex.titre}</p>
                      {ex.dateRealisation && <p className="text-xs text-muted-foreground">{ex.dateRealisation}</p>}
                    </div>
                    <span className="text-sm text-muted-foreground">{ex.dateAssignation}</span>
                    <div className="flex items-center justify-end gap-1">
                      {ex.statut === "terminé" ? (
                        <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <CheckCircle size={14} /> Fait
                        </span>
                      ) : ex.statut === "assigné" ? (
                        <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                          <Clock size={14} /> Attente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                          <Circle size={14} /> —
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export */}
            <button className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-primary text-primary font-medium hover:bg-primary/5 transition-all active:scale-95">
              <Download size={18} />
              Exporter en PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}