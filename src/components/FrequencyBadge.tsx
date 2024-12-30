interface FrequencyBadgeProps {
  frequency: string;
}

const frequencyMap: Record<string, string> = {
  'very_common': '极常用',
  'common': '常用',
  'uncommon': '不常用',
  'rare': '罕用',
  'archaic': '古语'
};

const colorMap: Record<string, string> = {
  'very_common': 'bg-green-500',
  'common': 'bg-blue-500',
  'uncommon': 'bg-yellow-500',
  'rare': 'bg-red-500',
  'archaic': 'bg-gray-500'
};

export function FrequencyBadge({ frequency }: FrequencyBadgeProps) {
  const chineseText = frequencyMap[frequency] || frequency;
  
  return (
    <span className={"inline-block px-3 py-1 text-sm rounded-full text-white " + colorMap[frequency]}>
      {chineseText}
    </span>
  );
} 