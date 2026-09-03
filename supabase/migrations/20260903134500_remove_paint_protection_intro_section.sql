-- Remove unused paint protection intro section copy from CMS.

DELETE FROM public.page_sections
WHERE page_key = 'services' AND section_key = 'paint-protection-intro';
