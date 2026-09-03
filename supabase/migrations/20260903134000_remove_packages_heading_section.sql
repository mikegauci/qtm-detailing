-- Remove unused packages comparison section copy from CMS.

DELETE FROM public.page_sections
WHERE page_key = 'services' AND section_key = 'packages-heading';
