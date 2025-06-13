import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

declare module '@mui/icons-material/Code' {
  const CodeIcon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  export default CodeIcon;
}

declare module '@mui/icons-material/Work' {
  const WorkIcon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  export default WorkIcon;
}

declare module '@mui/icons-material/School' {
  const SchoolIcon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  export default SchoolIcon;
}

declare module '@mui/icons-material/Verified' {
  const VerifiedIcon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  export default VerifiedIcon;
}
