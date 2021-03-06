import React, { useEffect, useState } from "react";
import {
  AppBar,
  Badge,
  Button,
  CssBaseline,
  Container,
  CircularProgress,
  Checkbox,
  Tab,
  Tabs,
  Typography,
  TextField,
  FormControlLabel,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import JokeCard from "./JokeCard";

const useStyles = makeStyles({
  form: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& > *": {
      margin: 20,
      width: "25ch",
    },
  },
});

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <CircularProgress />
    </div>
  );
}

function App() {
  const [jokes, setJokes] = useState([]);
  const [jokesToShow, setJokesToShow] = useState([]);

  const [categories, setCategories] = useState([]);
  const [filterCategories, setFilterCategories] = useState(["regular"]);

  const [likedJokes, setLikedJokes] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);

  const [firstName, setFirstName] = useState("Chuck");
  const [lastName, setLastName] = useState("Norris");

  const [loading, setLoading] = useState(false);

  const classes = useStyles();

  useEffect(() => {
    setLoading(true);
    fetchAndSetJokes();
    fetch("https://api.icndb.com/categories")
      .then((res) => res.json())
      .then((res) => {
        setCategories(["regular", ...res.value]);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchAndSetJokes = () => {
    fetch(
      `https://api.icndb.com/jokes?escape=javascript&firstName=${firstName}&lastName=${lastName}`
    )
      .then((res) => res.json())
      .then((res) => {
        setJokes(res.value);

        const filteredJokes = [];

        res.value.forEach((joke) => {
          if (categoryMatch(joke.categories)) {
            filteredJokes.push(joke);
          }
        });

        setJokesToShow(filteredJokes.slice(0, 10));
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  const likeJoke = (id) => {
    if (likedJokes.find((joke) => joke.id === id)) return;
    const likedJoke = jokes.find((joke) => joke.id === id);
    setLikedJokes([likedJoke, ...likedJokes]);
  };

  const unlikeJoke = (id) => {
    const newLikedJokes = likedJokes.filter((joke) => joke.id !== id);
    setLikedJokes(newLikedJokes);
  };

  const changeTab = (event, value) => {
    setCurrentTab(value);
  };

  const addMoreJokes = () => {
    const filteredJokes = [];

    jokes.forEach((joke) => {
      if (categoryMatch(joke.categories)) {
        filteredJokes.push(joke);
      }
    });
    setLoading(true);
    setTimeout(() => {
      setJokesToShow(filteredJokes.slice(0, jokesToShow.length + 10));
      setLoading(false);
    }, 400);
  };

  const observeElement = (bottomJoke) => {
    if (!bottomJoke) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          addMoreJokes();
          observer.unobserve(bottomJoke);
        }
      },
      {
        threshold: 1,
      }
    );
    observer.observe(bottomJoke);
  };

  useEffect(() => {
    const filteredJokes = [];

    jokes.forEach((joke) => {
      if (categoryMatch(joke.categories)) {
        filteredJokes.push(joke);
      }
    });

    setJokesToShow(filteredJokes.slice(0, 10));
  }, [filterCategories]);

  useEffect(() => {
    const bottomJokeEl = document.getElementById(
      `joke-${jokesToShow.length - 1}`
    );
    // Don't observe filtered jokes
    observeElement(bottomJokeEl);
  }, [jokesToShow]);

  const toggleCategory = (event) => {
    const category = event.target.name;

    if (filterCategories.includes(category)) {
      // If found then remove
      const filterCategoriesCopy = [...filterCategories];
      const categoryIndex = filterCategoriesCopy.indexOf(category);
      filterCategoriesCopy.splice(categoryIndex, 1);
      setFilterCategories(filterCategoriesCopy);
    } else {
      // Else add it
      setFilterCategories([...filterCategories, category]);
    }
  };

  const categoryMatch = (jokeCategories) => {
    if (jokeCategories.length === 0) jokeCategories[0] = "regular";

    for (let i = 0; i < jokeCategories.length; i++) {
      if (filterCategories.includes(jokeCategories[i])) return true;
    }
    return false;
  };

  const changeName = (event) => {
    event.preventDefault();
    if (firstName.trim() === "" || lastName.trim() === "") return;
    fetchAndSetJokes();
  };

  return (
    <div className="App">
      <CssBaseline />
      <Container>
        <Typography variant="h2" align="center" style={{ margin: 20 }}>
          Chuck Norris Jokes
        </Typography>
        <AppBar style={{ marginBottom: 20 }} position="sticky">
          <Tabs value={currentTab} onChange={changeTab} centered>
            <Tab label="Home" id="home-tab" aria-controls="home-panel" />
            <Tab
              label={
                <Badge
                  color="secondary"
                  badgeContent={
                    likedJokes.length > 0 ? likedJokes.length : null
                  }
                >
                  Liked
                </Badge>
              }
              id="like-tab"
              aria-controls="like-panel"
            />
          </Tabs>
        </AppBar>
        <div role="tabpanel" hidden={currentTab !== 0}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <form onSubmit={changeName} noValidate className={classes.form}>
              <TextField
                id="firstName"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                id="lastName"
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <Button type="submit" color="primary" variant="contained">
                Submit
              </Button>
            </form>
          </div>
          {/* Category Filters */}
          {categories.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  name={category}
                  color="primary"
                  checked={filterCategories.includes(category)}
                  onChange={toggleCategory}
                />
              }
              label={category}
            />
          ))}
          {/* Joke Cards */}
          {jokesToShow.map((joke, index) => {
            if (categoryMatch(joke.categories)) {
              return (
                <JokeCard
                  key={joke.id}
                  joke={joke}
                  likeJoke={likeJoke}
                  unlikeJoke={unlikeJoke}
                  index={index}
                />
              );
            }
          })}
          {loading && <Spinner />}
        </div>
        <div role="tabpanel" hidden={currentTab !== 1}>
          {likedJokes.map((joke) => (
            <JokeCard
              key={joke.id}
              joke={joke}
              likeJoke={likeJoke}
              unlikeJoke={unlikeJoke}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}

export default App;
