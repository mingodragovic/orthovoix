// src/app/pages/ExerciseCreate.tsx
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, Upload, Mic, Check, ChevronRight } from "lucide-react";
import { Avatar } from "../components/common/Avatar";
import { patients } from "../../data/mockData";

export function ExerciseCreate() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { t } = useTranslation();
  
  const [step, setStep] = useState(1);
  const [titre, setTitre] = useState("");
  const [mot, setMot] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [recording, setRecording] = useState(false);
  const [selected, setSelected] = useState<number[]>([1, 3]);

  const canNext1 = titre.trim() && mot.trim();

  const handleCreate = () => {
    showToast.success(t('exercises.create.success', "Exercice créé et assigné à 3 patients ✅"));
    navigate("/ortho-dashboard");
  };

  const stepLabels = [
    t('exerciseCreate.contentStep', "📝 Contenu"),
    t('exerciseCreate.mediaStep', "🎵 Médias"),
    t('exerciseCreate.assignmentStep', "👥 Attribution"),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <button onClick={() => navigate("/ortho-dashboard")} className="flex items-center gap-2 text-primary hover:bg-primary/10 px-3 py-2 rounded-xl transition-colors">
        <ArrowLeft size={18} /> 
        <span className="font-medium">{t('common.back', 'Retour')}</span>
      </button>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border/50">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
          {t('exerciseCreate.title', "Nouvel exercice")}
        </h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <Check size={16} /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 rounded-full ${step > s ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {stepLabels[step - 1]}
          </span>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  {t('exerciseCreate.exerciseTitle', "Titre de l'exercice *")}
                </label>
                <input 
                  value={titre} 
                  onChange={(e) => setTitre(e.target.value)} 
                  placeholder={t('exerciseCreate.exerciseTitlePlaceholder', "Ex: Son SH - Niveau 1")}
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  {t('exerciseCreate.targetWord', "Mot / Phrase cible *")}
                </label>
                <input 
                  value={mot} 
                  onChange={(e) => setMot(e.target.value)} 
                  placeholder={t('exerciseCreate.targetWordPlaceholder', "Ex: chapeau, chat, cheval")}
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  {t('exerciseCreate.instructionsLabel', "Instructions pour le parent")}
                </label>
                <textarea 
                  value={instructions} 
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={t('exerciseCreate.instructionsPlaceholder', "Expliquez comment réaliser l'exercice à la maison...")}
                  rows={4}
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none" 
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {t('exerciseCreate.illustrativeImage', "Image illustrative")}
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
                  className="w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                  style={{ borderColor: dragOver ? "#4A90D9" : "#CBD5E0", background: dragOver ? "#EBF4FF" : "#F7FAFC" }}
                >
                  <Upload size={32} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    {t('exerciseCreate.dragDropImage', "Glisser-déposer une image")}
                    <br />
                    <span className="text-primary text-xs">{t('exerciseCreate.clickToBrowse', "ou cliquer pour parcourir")}</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {t('exerciseCreate.demoAudio', "Audio de démonstration")}
                </label>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setRecording(!recording)}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                      recording 
                        ? "bg-red-50 text-red-600 border-2 border-red-400" 
                        : "bg-green-50 text-green-600 border-2 border-green-400 hover:bg-green-100"
                    }`}
                  >
                    <Mic size={18} />
                    {recording ? t('common.done', "Arrêter") : t('exerciseCreate.record', "Enregistrer")}
                  </button>
                  <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-muted border-2 border-border hover:bg-muted/70 transition-all active:scale-95">
                    <Upload size={18} className="text-muted-foreground" />
                    {t('exerciseCreate.import', "Importer")}
                  </button>
                </div>
                {recording && (
                  <div className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-200">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-xs text-red-600 font-medium">
                      {t('exerciseCreate.recordingInProgress', "Enregistrement en cours...")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t('exerciseCreate.assignToPatients', "Assigner à des patients")}</h3>
              <p className="text-xs text-muted-foreground">{t('exerciseCreate.selectPatients', "Sélectionnez les patients qui recevront cet exercice")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patients.filter((p) => p.statut === "Actif").map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all text-left ${
                      selected.includes(p.id) 
                        ? "bg-primary/5 border-2 border-primary" 
                        : "bg-white border-2 border-border hover:border-primary/30"
                    }`}
                  >
                    <Avatar initials={p.avatar} size={40} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.nom}</p>
                      <p className="text-xs text-muted-foreground">{p.age} {t('patients.age', 'ans')}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      selected.includes(p.id) ? "bg-primary" : "bg-muted"
                    }`}>
                      {selected.includes(p.id) && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-border">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)} 
              className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              {t('exerciseCreate.back', "← Retour")}
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)} 
              disabled={step === 1 && !canNext1}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('exerciseCreate.next', "Suivant")} <ChevronRight size={16} className="inline ml-1" />
            </button>
          ) : (
            <button 
              onClick={handleCreate} 
              disabled={selected.length === 0}
              className="px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('exerciseCreate.createAndAssign', "✨ Créer et assigner")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}