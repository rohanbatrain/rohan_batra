import { differenceInMonths, differenceInYears, format } from 'date-fns';
import { Experience } from '@/types/experience';

/**
 * Calculate duration between two dates in human-readable format
 * Example: "2 yrs 3 mos" or "6 mos"
 */
export function calculateDuration(
  startDate: Date,
  endDate: Date | null | undefined
): string {
  const end = endDate || new Date();
  const start = new Date(startDate);
  
  const totalMonths = differenceInMonths(end, start);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0 && months === 0) {
    return '1 mo';
  }

  const parts: string[] = [];
  
  if (years > 0) {
    parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  }
  
  if (months > 0) {
    parts.push(`${months} mo${months > 1 ? 's' : ''}`);
  }

  return parts.join(' ');
}

/**
 * Format date range for display
 * Example: "Aug 2023 - Present" or "Jan 2021 - Dec 2022"
 */
export function formatDateRange(
  startDate: Date,
  endDate: Date | null | undefined,
  isCurrent: boolean
): string {
  const start = format(new Date(startDate), 'MMM yyyy');
  
  if (isCurrent || !endDate) {
    return `${start} - Present`;
  }
  
  const end = format(new Date(endDate), 'MMM yyyy');
  return `${start} - ${end}`;
}

/**
 * Calculate total years of experience from an array of experiences
 */
export function calculateTotalYears(experiences: Experience[]): number {
  let totalMonths = 0;

  for (const exp of experiences) {
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const start = new Date(exp.startDate);
    totalMonths += differenceInMonths(end, start);
  }

  return Math.floor(totalMonths / 12);
}

/**
 * Sort experiences by display order, then by start date (most recent first)
 */
export function sortExperiences(experiences: Experience[]): Experience[] {
  return [...experiences].sort((a, b) => {
    // Primary sort: displayOrder (ascending)
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    
    // Secondary sort: startDate (descending - most recent first)
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
}

/**
 * Validate date range
 */
export function isValidDateRange(
  startDate: Date | string,
  endDate: Date | string | null | undefined
): boolean {
  if (!endDate) return true;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return end > start;
}

/**
 * Enrich experience with computed fields
 */
export function enrichExperience(experience: Experience): Experience {
  return {
    ...experience,
    duration: calculateDuration(experience.startDate, experience.endDate),
    dateRange: formatDateRange(
      experience.startDate,
      experience.endDate,
      experience.isCurrent
    ),
  };
}

/**
 * Enrich multiple experiences with computed fields
 */
export function enrichExperiences(experiences: Experience[]): Experience[] {
  return experiences.map(enrichExperience);
}

/**
 * Filter experiences by skills
 */
export function filterBySkills(
  experiences: Experience[],
  skills: string[]
): Experience[] {
  if (skills.length === 0) return experiences;
  
  return experiences.filter((exp) =>
    skills.some((skill) =>
      exp.skills.some((expSkill) =>
        expSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  );
}

/**
 * Get unique skills from all experiences
 */
export function extractUniqueSkills(experiences: Experience[]): string[] {
  const skillsSet = new Set<string>();
  
  experiences.forEach((exp) => {
    exp.skills.forEach((skill) => skillsSet.add(skill));
  });
  
  return Array.from(skillsSet).sort();
}
