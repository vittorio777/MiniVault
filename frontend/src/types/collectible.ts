export interface Collectible {
  id: number;
  userId: number;
  title: string;
  category: string;
  description: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  createdAt: string;
  updatedAt: string;
}



    // public int Id { get; set; }
    // public int UserId { get; set; }

    // public string Title { get; set; } = string.Empty;
    // public string Category { get; set; } = string.Empty;
    // public string Description { get; set; } = string.Empty;
    // public string OriginalImageUrl { get; set; } = string.Empty;
    // public string GeneratedImageUrl { get; set; } = string.Empty;

    // public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    // public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;