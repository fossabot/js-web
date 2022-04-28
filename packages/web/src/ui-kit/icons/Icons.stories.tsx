import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import Eye from './Eye';
import EyeSlash from './EyeSlash';
import { IconCatalog, IconCatalogItem } from './IconCatalog';

export default {
  title: 'Components/Icons',
  component: IconCatalog,
} as ComponentMeta<typeof IconCatalog>;

const Template: ComponentStory<typeof IconCatalogItem> = (args) => (
  <IconCatalogItem {...args} />
);

export const IconCat = () => <IconCatalog className="h-8 w-8" />;

export const EyeIcon = Template.bind({});
EyeIcon.args = {
  label: 'Eye',
  icon: <Eye className="h-5 w-5" />,
};

export const EyeSlashIcon = Template.bind({});
EyeSlashIcon.args = {
  label: 'EyeSlash',
  icon: <EyeSlash className="h-5 w-5" />,
};
