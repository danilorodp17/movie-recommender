import pickle
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data"

class MovieRecommender:
    def __init__(self):
        self.model = None
        self.df_pivot = None
        self.matriz_reduzida = None
        self.movies = None
        self.df_sample = None

    def carregar_modelo(self):
        print("⏳ Carregando modelo...")
        with open(DATA_DIR / "models" / "svd_model.pkl", "rb") as f:
            dados = pickle.load(f)

        self.df_pivot = dados["df_pivot"]
        self.matriz_reduzida = dados["matriz_reduzida"]

        self.movies = pd.read_csv(DATA_DIR / "movies_filtrados.csv")
        self.df_sample = pd.read_csv(DATA_DIR / "ratings_sample.csv")
        print("✅ Modelo carregado!")

    def recomendar(self, user_id: int, n: int = 10):
        if user_id not in self.df_pivot.index:
            return None

        user_idx = self.df_pivot.index.get_loc(user_id)
        user_vec = self.matriz_reduzida[user_idx].reshape(1, -1)
        similaridades = cosine_similarity(user_vec, self.matriz_reduzida)[0]

        usuarios_similares = np.argsort(similaridades)[::-1][1:21]
        filmes_vistos = set(self.df_pivot.columns[self.df_pivot.loc[user_id] > 0])

        pontuacoes = {}
        for idx in usuarios_similares:
            similar_user_id = self.df_pivot.index[idx]
            peso = similaridades[idx]
            filmes_usuario = self.df_pivot.loc[similar_user_id]

            for movie_id, rating in filmes_usuario.items():
                if rating > 0 and movie_id not in filmes_vistos:
                    pontuacoes[movie_id] = pontuacoes.get(movie_id, 0) + rating * peso

        top_filmes = sorted(pontuacoes.items(), key=lambda x: x[1], reverse=True)[:n]

        resultado = []
        for movie_id, score in top_filmes:
            row = self.movies[self.movies["movieId"] == movie_id]
            if not row.empty:
                resultado.append({
                    "movieId": int(movie_id),
                    "title": row["title"].values[0],
                    "genres": row["genres"].values[0],
                    "score": round(float(score), 3)
                })

        return resultado

    def filmes_avaliados(self, user_id: int, n: int = 10):
        if user_id not in self.df_pivot.index:
            return None

        df_user = (self.df_sample[self.df_sample["userId"] == user_id]
                   .merge(self.movies, on="movieId")[["movieId", "title", "genres", "rating"]]
                   .sort_values("rating", ascending=False)
                   .head(n))

        return df_user.to_dict(orient="records")

    def buscar_filmes(self, query: str, n: int = 10):
        mask = self.movies["title"].str.contains(query, case=False, na=False)
        resultado = self.movies[mask].head(n)
        return resultado.to_dict(orient="records")


recommender = MovieRecommender()