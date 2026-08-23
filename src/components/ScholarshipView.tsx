import React, { useState } from 'react';
import { GradeId, ScholarshipItem } from '../types';
import { SCHOLARSHIPS } from '../data/scholarshipData';
import {
  Award,
  Filter,
  CheckCircle,
  ExternalLink,
  FileCheck2,
  Calendar,
  IndianRupee,
  School,
  Building,
  HelpCircle
} from 'lucide-react';

interface ScholarshipViewProps {
  grade: GradeId;
  board: string;
}

export const ScholarshipView: React.FC<ScholarshipViewProps> = ({ grade, board }) => {
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>(grade);
  const [expandedId, setExpandedId] = useState<string | null>(SCHOLARSHIPS[0].id);

  const filteredScholarships = SCHOLARSHIPS.filter((s) => {
    const matchGrade = selectedGradeFilter === 'All' || s.grades.includes(selectedGradeFilter as GradeId);
    const matchState = selectedState === 'All' || s.state === 'All India' || s.state === 'National' || s.state === selectedState;
    return matchGrade && matchState;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#221631] via-[#2B1A3D] to-[#3C1F4D] text-[#FFF6E9] p-6 rounded-3xl shadow-xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB937]/20 border border-[#FFB937]/30 text-[#FFD873] text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            Financial Aid & Merit Matcher
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Scholarships for Class 9 & 10 Students
          </h1>
          <p className="text-xs sm:text-sm text-[#D9C9E6] mt-1 max-w-xl">
            Never let financial hardship disrupt education. Explore verified government scholarships, DBT grants, fee waivers, and textbook allowances.
          </p>
        </div>

        {/* Highlight counter */}
        <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center min-w-[140px]">
          <div className="text-xs text-[#FFB937] font-bold uppercase tracking-wider">Available Schemes</div>
          <div className="font-display text-3xl font-extrabold text-white mt-0.5">
            {filteredScholarships.length}
          </div>
          <div className="text-[11px] text-[#D9C9E6]">Active for 2026</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E3D6BC] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B1330]">
            <Filter className="w-4 h-4 text-[#FF5F4E]" />
            <span>Filters:</span>
          </div>

          {/* Grade filter */}
          <select
            aria-label="Filter scholarships by grade"
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="text-xs font-semibold bg-[#FFF6E9] border border-[#E3D6BC] rounded-lg px-2.5 py-1.5 text-[#1B1330] focus:outline-none"
          >
            <option value="All">All Grades (9 & 10)</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
          </select>

          {/* State filter */}
          <select
            aria-label="Filter scholarships by state"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs font-semibold bg-[#FFF6E9] border border-[#E3D6BC] rounded-lg px-2.5 py-1.5 text-[#1B1330] focus:outline-none"
          >
            <option value="All">All Regions (National & States)</option>
            <option value="Telangana">Telangana State (TS ePASS)</option>
            <option value="National">Central / National Schemes</option>
          </select>
        </div>

        <div className="text-xs text-[#8A7A5C]">
          Showing <b>{filteredScholarships.length}</b> verified opportunities
        </div>
      </div>

      {/* Scholarships List */}
      <div className="space-y-4">
        {filteredScholarships.map((s) => {
          const isExpanded = expandedId === s.id;
          return (
            <div
              key={s.id}
              className="bg-white rounded-3xl border border-[#E3D6BC] shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Card Header */}
              <div
                className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none"
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF5F4E]/15 text-[#FF5F4E]">
                      {s.state}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3ECDD] text-[#5A4E38]">
                      {s.grades.join(' & ')}
                    </span>
                  </div>

                  <h2 className="font-display text-lg sm:text-xl font-bold text-[#1B1330]">
                    {s.title}
                  </h2>
                  <div className="text-xs text-[#8A7A5C] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>{s.provider}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                  <div className="text-right">
                    <div className="text-[11px] text-[#8A7A5C] uppercase font-bold tracking-wider">Grant Value</div>
                    <div className="font-display font-bold text-base sm:text-lg text-[#2E8B6F] flex items-center gap-0.5 justify-end">
                      <span>{s.grantAmount}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-xs font-bold text-[#FF5F4E] hover:underline flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Details ▲' : 'View Eligibility ▼'}</span>
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#E3D6BC] bg-[#FFF6E9]/40 space-y-5 animate-fadeIn">
                  {/* Eligibility & Target */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-4 rounded-2xl border border-[#E3D6BC]">
                      <div className="font-bold text-[#1B1330] mb-1 flex items-center gap-1.5">
                        <School className="w-4 h-4 text-[#FF5F4E]" />
                        <span>Eligibility Criteria:</span>
                      </div>
                      <p className="text-[#5A4E38] leading-relaxed">{s.eligibility}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E3D6BC]">
                      <div className="font-bold text-[#1B1330] mb-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#FFB937]" />
                        <span>Application Timeline & Window:</span>
                      </div>
                      <p className="text-[#5A4E38] leading-relaxed">{s.deadline}</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <div className="text-xs font-bold text-[#1B1330] mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#2E8B6F]" />
                      <span>Key Scheme Benefits:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {s.benefits.map((b, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-[#E3D6BC] text-[#5A4E38]">
                          • {b}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Documents Checklist */}
                  <div>
                    <div className="text-xs font-bold text-[#1B1330] mb-2 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-[#FF5F4E]" />
                      <span>Documents Needed for Application:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {s.documentsRequired.map((doc, idx) => (
                        <span
                          key={idx}
                          className="bg-[#F3ECDD] border border-[#E3D6BC] px-3 py-1.5 rounded-xl text-[#5A4E38] font-semibold"
                        >
                          📄 {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Apply CTA */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E3D6BC]">
                    <div className="text-xs text-[#8A7A5C]">
                      Free application supported under National & State Welfare initiatives.
                    </div>

                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-[#1B1330] hover:bg-[#221631] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
