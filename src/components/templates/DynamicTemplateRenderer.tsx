import React from 'react';
import { TemplateRenderProps } from './templateTypes';
import { SiliconValleyTemplate } from './SiliconValleyTemplate';
import { ModernSplitTemplate } from './ModernSplitTemplate';
import { ExecutiveSerifTemplate } from './ExecutiveSerifTemplate';
import { DachLebenslaufTemplate } from './DachLebenslaufTemplate';
import { DubaiExecutiveTemplate } from './DubaiExecutiveTemplate';
import { NordicMinimalistTemplate } from './NordicMinimalistTemplate';
import { TokyoStructuredTemplate } from './TokyoStructuredTemplate';
import { CreativeAccentTemplate } from './CreativeAccentTemplate';
import { ClassicAtsTemplate } from './ClassicAtsTemplate';

export const DynamicTemplateRenderer: React.FC<TemplateRenderProps> = (props) => {
  const style = props.templateMeta.layoutStyle || 'classic-ats';

  switch (style) {
    case 'silicon-valley':
      return <SiliconValleyTemplate {...props} />;
    case 'modern-split':
      return <ModernSplitTemplate {...props} />;
    case 'executive-serif':
      return <ExecutiveSerifTemplate {...props} />;
    case 'dach-lebenslauf':
      return <DachLebenslaufTemplate {...props} />;
    case 'dubai-executive':
      return <DubaiExecutiveTemplate {...props} />;
    case 'nordic-minimalist':
      return <NordicMinimalistTemplate {...props} />;
    case 'tokyo-structured':
      return <TokyoStructuredTemplate {...props} />;
    case 'creative-accent':
      return <CreativeAccentTemplate {...props} />;
    case 'classic-ats':
    case 'uk-standard':
    case 'canadian-bilingual':
    case 'europass-clean':
    default:
      return <ClassicAtsTemplate {...props} />;
  }
};
