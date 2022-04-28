import * as Icons from './index';

interface IIconCatalogItem {
  icon: React.ReactElement;
  label: string;
}

const IconCatalogItem = ({ icon, label }: IIconCatalogItem) => {
  return (
    <div className="rounded-lg border-gray-200 bg-white py-1 px-2 text-gray-400">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </div>
  );
};

// Used for storybook only.
const IconCatalog = ({ className }: { className?: string }) => {
  const icons = Object.keys(Icons);
  return (
    <div className="grid grid-cols-12 gap-3">
      {icons.map((iconName, index) => {
        const IconComponent = Icons[iconName];
        return (
          <div key={index} className="truncate">
            <IconComponent className={className} />
            <span className="text-xs">{iconName}</span>
          </div>
        );
      })}
    </div>
  );
};

export { IconCatalogItem, IconCatalog };
