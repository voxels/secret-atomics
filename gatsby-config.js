require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});



module.exports = {
  siteMetadata: {
    title: "Secret Atomics",
    description: "Secret Atomics LLC",
  },
  plugins: [
    "gatsby-transformer-sharp",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sharp",
    "gatsby-plugin-image",
    'gatsby-plugin-resolve-src',
    'gatsby-plugin-eslint',
    {
      resolve: "gatsby-source-contentful",
      options: {
        spaceId: process.env.CONTENTFUL_SPACE_ID,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
        host: process.env.CONTENTFUL_HOST
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {},
    },
  ],
  trailingSlash: "always"
};
