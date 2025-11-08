import { useState } from "react";

interface Props {
  onSubmit: (ingredients: string[]) => void;
}

export default function IngredientInput({ onSubmit }: Props) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input) return;
    const ingredients = input.split(",").map(i => i.trim());
    onSubmit(ingredients);
    setInput("");
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Enter ingredients, separated by commas"
        className="border p-2 rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={handleAdd}
      >
        Generate Recipes
      </button>
    </div>
  );
}
