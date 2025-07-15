import {
  Breadcrumb as BreadcrumbComponent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export const Breadcrumb = ({
  paths,
}: {
  paths: { label: string; href: string }[];
}) => {
  return (
    <BreadcrumbComponent className="mb-4">
      <BreadcrumbList>
        {paths.map((path, index) => (
          <div key={path.href} className="flex items-center gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink href={path.href}>{path.label}</BreadcrumbLink>
            </BreadcrumbItem>
            {index < paths.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </BreadcrumbComponent>
  );
};
