import React, { useState } from 'react';
import { GradeId, Gender, SchoolType, SessionUser } from '../types';
import { GRADE_OPTIONS } from '../data/curriculumData';
import * as authService from '../services/authService';
import { Sparkles, GraduationCap, Users, Lock, User, IdCard, School, MapPin } from 'lucide-react';

interface AuthViewProps {
  onAuthenticated: (user: SessionUser) => void;
}

type Role = 'student' | 'teacher';
type Mode = 'login' | 'register';

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E3D6BC] bg-white text-sm text-[#1B1330] focus:outline-none focus:border-[#FF5F4E] font-medium';
const labelClass = 'text-xs font-bold text-[#5A4E38] mb-1 block';

export const AuthView: React.FC<AuthViewProps> = ({ onAuthenticated }) => {
  const [role, setRole] = useState<Role>('student');
  const [mode, setMode] = useState<Mode>('register');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shared fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolType, setSchoolType] = useState<SchoolType>('Government');
  const [grade, setGrade] = useState<GradeId>('Class 9');

  // Student-only
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [place, setPlace] = useState('');

  // Teacher-only
  const [teacherCode, setTeacherCode] = useState('');

  const resetFormError = () => setError(null);

  const switchRole = (r: Role) => {
    setRole(r);
    resetFormError();
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    resetFormError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'student') {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        if (!username.trim() || !schoolName.trim() || !place.trim()) {
          setError('Please fill in all fields.');
          return;
        }
        setIsSubmitting(true);
        const result = await authService.registerStudent({
          username,
          password,
          schoolType,
          schoolName,
          gender,
          grade,
          place,
        });
        setIsSubmitting(false);
        if (!result.success || !result.account) {
          setError(result.error || 'Registration failed.');
          return;
        }
        onAuthenticated({ role: 'student', account: result.account });
      } else {
        setIsSubmitting(true);
        const result = await authService.loginStudent(username, password);
        setIsSubmitting(false);
        if (!result.success || !result.account) {
          setError(result.error || 'Login failed.');
          return;
        }
        onAuthenticated({ role: 'student', account: result.account });
      }
    } else {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        if (!teacherCode.trim() || !schoolName.trim()) {
          setError('Please fill in all fields.');
          return;
        }
        setIsSubmitting(true);
        const result = await authService.registerTeacher({
          teacherCode,
          password,
          schoolName,
          classTaught: grade,
          schoolType,
        });
        setIsSubmitting(false);
        if (!result.success || !result.account) {
          setError(result.error || 'Registration failed.');
          return;
        }
        onAuthenticated({ role: 'teacher', account: result.account });
      } else {
        setIsSubmitting(true);
        const result = await authService.loginTeacher(teacherCode, password);
        setIsSubmitting(false);
        if (!result.success || !result.account) {
          setError(result.error || 'Login failed.');
          return;
        }
        onAuthenticated({ role: 'teacher', account: result.account });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#221631] via-[#2B1A3D] to-[#3C1F4D] px-4 py-10 relative overflow-hidden">
      <div className="absolute top-[-50px] left-[-50px] w-72 h-72 rounded-full bg-[#FF5F4E]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-36 right-[-60px] w-80 h-80 rounded-full bg-[#FFB937]/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB937]/15 border border-[#FFB937]/35 text-[#FFB937] text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            DoubtBridge · Class 5–10
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#FFF6E9]">Welcome</h1>
          <p className="text-[#D9C9E6] text-sm mt-1">Sign in or create an account to continue.</p>
        </div>

        <div className="bg-[#FFF6E9] rounded-3xl p-6 shadow-2xl border border-[#E3D6BC]">
          {/* Role Tabs */}
          <div className="flex gap-1 bg-[#EADFC9] p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => switchRole('student')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                role === 'student' ? 'bg-[#1B1330] text-white shadow' : 'text-[#5A4E38]'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => switchRole('teacher')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                role === 'teacher' ? 'bg-[#1B1330] text-white shadow' : 'text-[#5A4E38]'
              }`}
            >
              <Users className="w-4 h-4" /> Teacher
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-4 mb-5 border-b border-[#E3D6BC]">
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`pb-2 text-sm font-bold border-b-2 -mb-px transition ${
                mode === 'register' ? 'border-[#FF5F4E] text-[#1B1330]' : 'border-transparent text-[#8A7A5C]'
              }`}
            >
              New here? Register
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`pb-2 text-sm font-bold border-b-2 -mb-px transition ${
                mode === 'login' ? 'border-[#FF5F4E] text-[#1B1330]' : 'border-transparent text-[#8A7A5C]'
              }`}
            >
              Already registered? Log in
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Identifier field */}
            {role === 'student' ? (
              <div>
                <label className={labelClass}>
                  <User className="w-3 h-3 inline mr-1" /> Username
                </label>
                <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" required />
              </div>
            ) : (
              <div>
                <label className={labelClass}>
                  <IdCard className="w-3 h-3 inline mr-1" /> Teacher Code
                </label>
                <input className={inputClass} value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} placeholder="Your school-issued teacher code" required />
              </div>
            )}

            <div>
              <label className={labelClass}>
                <Lock className="w-3 h-3 inline mr-1" /> Password
              </label>
              <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            </div>

            {mode === 'register' && (
              <div>
                <label className={labelClass}>
                  <Lock className="w-3 h-3 inline mr-1" /> Confirm Password
                </label>
                <input
                  type="password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            )}

            {/* Registration-only extra fields */}
            {mode === 'register' && (
              <>
                <div>
                  <label className={labelClass}>
                    <School className="w-3 h-3 inline mr-1" /> School Name
                  </label>
                  <input className={inputClass} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Name of your school" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Type of School</label>
                    <select className={inputClass} value={schoolType} onChange={(e) => setSchoolType(e.target.value as SchoolType)}>
                      <option value="Government">Government</option>
                      <option value="Private">Private</option>
                      <option value="Aided">Aided</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{role === 'student' ? 'Class' : 'Class You Teach'}</label>
                    <select className={inputClass} value={grade} onChange={(e) => setGrade(e.target.value as GradeId)}>
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Gender</label>
                      <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>
                        <MapPin className="w-3 h-3 inline mr-1" /> Place
                      </label>
                      <input className={inputClass} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Town / City" required />
                    </div>
                  </div>
                )}
              </>
            )}

            {error && <div className="text-xs font-bold text-[#FF5F4E] bg-[#FF5F4E]/10 border border-[#FF5F4E]/30 rounded-xl p-2.5">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full py-3 rounded-2xl font-display font-bold text-sm bg-gradient-to-r from-[#FF5F4E] to-[#FFB937] text-[#1B1330] shadow-lg hover:shadow-xl transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Please wait…'
                : mode === 'register'
                ? `Create ${role === 'student' ? 'Student' : 'Teacher'} Account`
                : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
