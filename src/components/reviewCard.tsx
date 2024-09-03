import { StarIcon } from "lucide-react"

interface Review {
  id: string;
  text: string;
  rating: number;
  date: string;
  store: 'App Store' | 'Play Store';
}

export default function ReviewCard({ review }: { review: Review }) {
    return (
      <div className="bg-white p-3 rounded-md shadow mb-2">
        <p className="text-sm text-stone-700 mb-1">{review.text}</p>
        <div className="flex items-center justify-between">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400' : 'text-stone-300'}`}
              />
            ))}
          </div>
          <span className="text-xs text-stone-500">{review.date} - {review.store}</span>
        </div>
      </div>
    )
  }