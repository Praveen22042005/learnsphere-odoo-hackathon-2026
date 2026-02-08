-- ============================================================================
-- Migration: Update Badges with Online Icon URLs
-- Description: Replace local SVG paths with online URLs from badge icon CDN
-- ============================================================================

-- Update existing badges with online icon URLs
UPDATE badges SET icon_url = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Seedling/3D/seedling_3d.png' 
WHERE name = 'Newbie';

UPDATE badges SET icon_url = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Compass/3D/compass_3d.png' 
WHERE name = 'Explorer';

UPDATE badges SET icon_url = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sports%20medal/3D/sports_medal_3d.png' 
WHERE name = 'Achiever';

UPDATE badges SET icon_url = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Glowing%20star/3D/glowing_star_3d.png' 
WHERE name = 'Specialist';

UPDATE badges SET icon_url = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Gem%20stone/3D/gem_stone_3d.png' 
WHERE name = 'Expert';

UPDATE badges SET icon_url = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Crown/3D/crown_3d.png' 
WHERE name = 'Master';

-- Add comment to table documenting the icon_url format
COMMENT ON COLUMN badges.icon_url IS 'Online URL to badge icon image (PNG, SVG, or other image format)';
