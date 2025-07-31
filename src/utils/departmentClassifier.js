// Rule-based department classification
const departmentKeywords = {
  'Roads & Transportation': [
    'pothole', 'road', 'street', 'traffic', 'signal', 'light', 'crossing', 'sidewalk', 'pavement',
    'speed bump', 'road sign', 'street light', 'traffic light', 'bus stop', 'parking', 'vehicle'
  ],
  'Water & Sanitation': [
    'water', 'sewage', 'drain', 'pipe', 'leak', 'flood', 'overflow', 'manhole', 'gutter',
    'water supply', 'drinking water', 'sewer', 'waste', 'garbage', 'trash', 'bin'
  ],
  'Electricity & Power': [
    'electricity', 'power', 'transformer', 'wire', 'cable', 'outage', 'blackout', 'street light',
    'electrical', 'power line', 'electric pole', 'fuse', 'circuit'
  ],
  'Public Safety': [
    'crime', 'theft', 'vandalism', 'fire', 'emergency', 'police', 'safety', 'security',
    'broken glass', 'graffiti', 'dangerous', 'hazard', 'accident'
  ],
  'Parks & Recreation': [
    'park', 'playground', 'garden', 'tree', 'bench', 'fountain', 'sports', 'recreation',
    'swing', 'slide', 'basketball', 'tennis', 'football', 'cricket'
  ],
  'Public Health': [
    'health', 'medical', 'hospital', 'clinic', 'disease', 'infection', 'sanitation',
    'hygiene', 'mosquito', 'pest', 'rodent', 'stray animal'
  ],
  'Education': [
    'school', 'college', 'university', 'education', 'student', 'teacher', 'classroom',
    'library', 'laboratory', 'playground', 'canteen'
  ],
  'General Maintenance': [
    'maintenance', 'repair', 'broken', 'damaged', 'fallen', 'cracked', 'loose',
    'general', 'miscellaneous', 'other'
  ]
}

export const classifyDepartment = (description) => {
  if (!description) return 'General Maintenance'
  
  const lowerDescription = description.toLowerCase()
  let maxScore = 0
  let bestDepartment = 'General Maintenance'
  
  for (const [department, keywords] of Object.entries(departmentKeywords)) {
    let score = 0
    for (const keyword of keywords) {
      if (lowerDescription.includes(keyword)) {
        score += 1
      }
    }
    if (score > maxScore) {
      maxScore = score
      bestDepartment = department
    }
  }
  
  return bestDepartment
}

export const getDepartmentKeywords = () => departmentKeywords 