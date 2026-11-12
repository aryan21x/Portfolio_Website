import { projectCategories } from '../data/portfolio';
import { MobileFilterDropdown } from './MobileFilterDropdown';

export const ProjectFilter = ({ category, onChange }) => (
  <div className="project-mobile-filter">
    <MobileFilterDropdown id="mobile-project-filter-options" label="Filter projects" value={category} options={projectCategories} onChange={onChange} sound="project" />
  </div>
);
