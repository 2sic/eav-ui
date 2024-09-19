
export interface InfoTemplate {
  label: string;
  value: string;
  link?: InfoTemplateLink;
}

export interface InfoTemplateLink {
  url: string;
  label: string;
  target: 'angular' | '_self' | '_blank';
}
