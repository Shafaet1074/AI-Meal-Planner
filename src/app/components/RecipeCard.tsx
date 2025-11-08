interface Props {
  title: string;
  instructions: string;
  nutrition: any;
  imageUrl?: string;
}

export default function RecipeCard({ title, instructions, nutrition, imageUrl }: Props) {
  return (
    <div className="bg-white shadow p-4 rounded space-y-3">
      <h2 className="text-xl font-bold">{title}</h2>
      {imageUrl && <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded" />}
      <p>{instructions}</p>
      {nutrition && (
        <div className="text-sm text-gray-600">
          <p>Calories: {nutrition.calories}</p>
          <p>Protein: {nutrition.protein}g</p>
          <p>Carbs: {nutrition.carbs}g</p>
          <p>Fats: {nutrition.fats}g</p>
        </div>
      )}
    </div>
  );
}
