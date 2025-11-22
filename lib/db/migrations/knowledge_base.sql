
-- Knowledge Base Documents Table
CREATE TABLE knowledge_base_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Null for system docs
    title TEXT NOT NULL,
    content TEXT, -- HTML or Markdown
    type TEXT NOT NULL, -- 'article', 'guide', 'tip'
    category TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT false, -- For system docs
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Favorites Table
CREATE TABLE kb_favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doc_id UUID REFERENCES knowledge_base_docs(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, doc_id)
);

-- Migrate existing tips if any (Assuming simple migration or just drop if empty)
-- INSERT INTO knowledge_base_docs (title, content, type, category)
-- SELECT tip, tip, 'tip', category FROM knowledge_base_tips;

-- Drop old table
DROP TABLE IF EXISTS knowledge_base_tips;

-- Pre-seed some generic preparedness documents
INSERT INTO knowledge_base_docs (title, content, type, category, is_public, user_id) VALUES
(
    'Water Storage Basics',
    'Store at least 1 gallon of water per person per day for 3 days for drinking and sanitation. Try to store a 2-week supply if possible. Consider the needs of pets. Keep water in a cool, dark place in its original container. Do not store water jugs in direct sunlight or near toxic substances like gasoline or pesticides.',
    'guide',
    'water',
    true,
    NULL
),
(
    'Emergency Communications Plan',
    'Create a paper copy of contact information for your family and other important people/offices, such as medical facilities, doctors, schools, or service providers. Identify an out-of-town contact who can act as a central point of contact to help your household reconnect. In an emergency, it may be easier to make a long-distance phone call than to call across town.',
    'article',
    'communications',
    true,
    NULL
),
(
    'Fire Safety Tips',
    'Test your smoke alarms once a month. Replace batteries at least once a year. Teach children what smoke alarms sound like and what to do when they hear one. Ensure that all household members know two ways to escape from every room of your home.',
    'tip',
    'fire-safety',
    true,
    NULL
),
(
    '72-Hour Kit Checklist',
    'A basic emergency supply kit could include the following recommended items: Water (one gallon per person per day for at least three days), Food (at least a three-day supply of non-perishable food), Battery-powered or hand crank radio and a NOAA Weather Radio with tone alert, Flashlight, First aid kit, Extra batteries, Whistle (to signal for help), Dust mask (to help filter contaminated air), Plastic sheeting and duct tape (to shelter in place), Moist towelettes, garbage bags and plastic ties (for personal sanitation), Wrench or pliers (to turn off utilities), Manual can opener (for food), Local maps, Cell phone with chargers and a backup battery.',
    'guide',
    'supplies',
    true,
    NULL
),
(
    'Power Outage Preparedness',
    'Keep freezers and refrigerators closed. The refrigerator will keep food cold for about 4 hours. A full freezer will keep the temperature for about 48 hours. Use a thermometer in the refrigerator and freezer so that you can know the temperature when the power is restored. Throw away some food if the temperature is 40 degrees or higher.',
    'article',
    'power',
    true,
    NULL
);
