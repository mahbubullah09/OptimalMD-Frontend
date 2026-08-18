import type { ComponentType } from "react";
import {
  AdvancedLabTestingIcon,
  AiDoctorIcon,
  BehavioralHealthIcon,
  ConciergeCareIcon,
  HormoneHealthIcon,
  ImagingIcon,
  type IconProps,
  LabTestsIcon,
  LifestyleWellnessIcon,
  MedicationsIcon,
  MentalHealthIcon,
  PeptidesIcon,
  StethoscopeIcon,
} from "./FeatureIcons";

/**
 * Maps the icon keys stored in MongoDB to components.
 *
 * Content in the CMS can only reference an icon by name, so this is the one
 * place that decides what each name draws. An unknown key renders nothing
 * rather than crashing the page — a typo in the admin should cost an icon,
 * not the whole section.
 */
export const heroFeatureIcons: Record<string, ComponentType<IconProps>> = {
  stethoscope: StethoscopeIcon,
  imaging: ImagingIcon,
  medications: MedicationsIcon,
  mentalHealth: MentalHealthIcon,
  labTests: LabTestsIcon,
  aiDoctor: AiDoctorIcon,
  advancedLab: AdvancedLabTestingIcon,
  hormone: HormoneHealthIcon,
  peptides: PeptidesIcon,
  behavioral: BehavioralHealthIcon,
  lifestyle: LifestyleWellnessIcon,
  concierge: ConciergeCareIcon,
};
