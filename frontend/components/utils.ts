export function mergeClassNames(
  defaultClasses: { [key: string]: string },
  customClasses: { [key: string]: string | undefined }
): { [key: string]: string } {
  return Object.keys(defaultClasses).reduce((acc, key) => {
    // Merge the default class name with the custom one (if it exists)
    acc[key] = `${defaultClasses[key]} ${customClasses[key] || ''}`.trim();
    return acc;
  }, {} as { [key: string]: string });
}
