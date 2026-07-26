import React, { useEffect } from 'react'

import type {Collectible} from '../types/collectible'

import { getCollectiblesByUserId } from '../api/collectiblesApi';





const HomePage = () => {
  const [collections, setCollections] = React.useState<Collectible[]>([]);

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    try {
        const data = await getCollectiblesByUserId(1); 
        setCollections(data);
    } catch (error) {
        console.error("Error fetching collections:", error);
    }
  }



  return (
    <div>
        {collections.map((collection) => (
            <div key={collection.id}>
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
            </div>
        ))}
    </div>
  )
}

export default HomePage