import { Authenticator, Flex, Heading } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify, Analytics, API } from "aws-amplify";
import Head from "next/head";
import React from "react";
import awsExports from "../src/aws-exports";
import { createPost } from "../src/graphql/mutations";
import { listPosts } from "../src/graphql/queries";
import styles from "../styles/Home.module.css";

Amplify.configure({
  ...awsExports,
});

export async function getStaticProps() {
  const { data } = await API.graphql({
    query: listPosts,
  });

  return {
    props: {
      posts: data.listPosts.items,
    },
  };
}

async function handleCreatePost(event) {
  event.preventDefault();

  const form = new FormData(event.target);

  try {
    const { data } = await API.graphql({
      authMode: "AMAZON_COGNITO_USER_POOLS",
      query: createPost,
      variables: {
        input: {
          title: form.get("title"),
          content: form.get("content"),
        },
      },
    });

    await Analytics.record({ name: "createPost" });

    // window.location.href = `/posts/${data.createPost.id}`;
  } catch ({ errors }) {
    console.error(...errors);
    throw new Error(errors[0].message);
  }
}

export default function Home({ posts = [] }) {
  return (
    <Flex direction="column">
      <Head>
        <title>Amplify + Next.js SSG</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Heading level={3}>Amplify + Next.js SSG</Heading>
        <p className={styles.description}>
          <code data-test="posts-count" className={styles.code}>
            {posts.length}
          </code>
          posts
        </p>

        <Flex>
          <Heading level={3}>Posts</Heading>
          {posts.map((post) => (
            <a
              data-test={`post-${post.id}`}
              className={styles.card}
              href={`/posts/${post.id}`}
              key={post.id}
            >
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </a>
          ))}
        </Flex>

        <Flex>
          <Heading level={3}>New Post</Heading>

          <Authenticator>
            {({ signOut, user }) => (
              <div>
                <pre data-test="user-details">
                  User: {JSON.stringify(user?.attributes, null, 2)}
                </pre>
                <form onSubmit={handleCreatePost}>
                  <fieldset>
                    <legend>Title</legend>
                    <input
                      defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
                      name="title"
                    />
                  </fieldset>

                  <fieldset>
                    <legend>Content</legend>
                    <textarea defaultValue="I built an Amplify app with Next.js!" name="content" />
                  </fieldset>

                  <button>Create Post</button>
                  <button type="button" onClick={signOut}>
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </Authenticator>
        </Flex>
      </main>
    </Flex>
  );
}
