import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  uuid,
  foreignKey,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Role Type
export const roleEnum = pgEnum("user_role", ["admin", "user", "pro"]);

/* Auth Schema
 *
 *
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  role: roleEnum("role").notNull().default("user"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const passkey = pgTable("passkey", {
  id: text("id").primaryKey(),
  name: text("name"),
  publicKey: text("public_key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  credentialID: text("credential_i_d").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(),
  backedUp: boolean("backed_up").notNull(),
  transports: text("transports"),
  createdAt: timestamp("created_at"),
});

export const userRelations = relations(user, ({ many }) => ({
  posts: many(posts),
  subscriptions: many(subscriptions, {
    relationName: "subscriptions_viewer_id_fkey",
  }),
  subscribers: many(subscriptions, {
    relationName: "subscriptions_creator_id_fkey",
  }),
  comments: many(comments),
  commentsReactions: many(commentsReactions),
}));

export const subscriptions = pgTable(
  "subscriptions",
  {
    viewerId: text("viewer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({
      name: "subscriptions_pk",
      columns: [t.viewerId, t.creatorId],
    }),
  ]
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  viewer: one(user, {
    fields: [subscriptions.viewerId],
    references: [user.id],
    relationName: "subscriptions_viewer_id_fkey",
  }),
  creator: one(user, {
    fields: [subscriptions.creatorId],
    references: [user.id],
    relationName: "subscriptions_creator_id_fkey",
  }),
}));

/* Product Schema
 *  Brand Table
 *  -- DELL IBM HP...
 *  Category Table
 *  -- Servers storages Networks...
 *  Product Table
 * -- R740 DL388...
 */

// ⌚️ Reusable timestamps - Define once, use everywhere!
export const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  fullName: text("full_name"),
  description: text("description"),
  logoImageKey: text("logo_image_key"),
  ...timestamps,
});

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
  series: many(productSeries),
}));

export const brandsInsertSchema = createInsertSchema(brands, {
  name: z.string().min(1).max(255),
});
export const brandsSelectSchema = createSelectSchema(brands).omit({
  createdAt: true,
  updatedAt: true,
});
export const brandsUpdateSchema = createUpdateSchema(brands);

export const productsCategories = pgTable(
  "products_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    ...timestamps,
  },
  (t) => [uniqueIndex("products_categories_name_idx").on(t.name)]
);

export const productsCategoriesRelations = relations(
  productsCategories,
  ({ many }) => ({
    products: many(products),
  })
);

export const ProductVisibility = pgEnum("visibility", [
  "draft",
  "public",
  "private",
]);

export const productSeries = pgTable(
  "product_series",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    name: text("name").notNull().unique(),
    ...timestamps,
  },
  (t) => [
    foreignKey({
      name: "product_series_brand_id_fkey",
      columns: [t.brandId],
      foreignColumns: [brands.id],
    }).onDelete("cascade"),
    uniqueIndex("product_series_name_idx").on(t.name),
  ]
);

export const productSeriesRelations = relations(
  productSeries,
  ({ one, many }) => ({
    brand: one(brands, {
      fields: [productSeries.brandId],
      references: [brands.id],
    }),
    products: many(products),
  })
);

export const seriesInsertSchema = createInsertSchema(productSeries, {
  name: z.string().min(1).max(255),
});
export const seriesSelectSchema = createSelectSchema(productSeries).omit({
  createdAt: true,
  updatedAt: true,
});
export const seriesUpdateSchema = createUpdateSchema(productSeries);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  model: text("model").notNull(),
  generation: text("generation"),
  description: text("description"),
  visibility: ProductVisibility("visibility").default("draft").notNull(),
  managementIp: text("management_ip"),
  userName: text("user_name"),
  userPassword: text("user_password"),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => productsCategories.id),
  ...timestamps,
  seriesId: uuid("series_id").references(() => productSeries.id),
});

export const productsSelectSchema = createSelectSchema(products).omit({
  createdAt: true,
  updatedAt: true,
});
export const productsInsertSchema = createInsertSchema(products, {
  model: z.string().min(1).max(255),
});
export const productsUpdateSchema = createUpdateSchema(products);

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  categories: one(productsCategories, {
    fields: [products.categoryId],
    references: [productsCategories.id],
  }),
  series: one(productSeries, {
    fields: [products.seriesId],
    references: [productSeries.id],
  }),
  images: many(productImage),
  downloads: many(downloads),
  documents: many(documents),
  posts: many(posts),
}));

export const productImage = pgTable(
  "product_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    primary: boolean("primary").notNull().default(false),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    imageKey: text("image_key").notNull(),
    ...timestamps,
  },
  (t) => [
    foreignKey({
      name: "product_image_product_id_fkey",
      columns: [t.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
  ]
);

export const productImageInsertSchema = createInsertSchema(productImage, {
  productId: z.string().uuid(),
  imageKey: z.string(),
  primary: z.boolean().default(false),
});
export const productImageUpdateSchema = createUpdateSchema(productImage);
export const productImageSelectSchema = createSelectSchema(productImage);

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(products, {
    fields: [productImage.productId],
    references: [products.id],
  }),
}));

/* Post Schema
 *  Blog posts for troubleshooting issues with servers, storage, and network devices
 *  -- Related to products
 *  -- Contains solutions and workarounds
 */

export const postVisibility = pgEnum("post_visibility", [
  "draft",
  "public",
  "private",
]);

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content"),
  productId: uuid("product_id").references(() => products.id),
  authorId: text("author_id").references(() => user.id),
  visibility: postVisibility("visibility").notNull().default("draft"),
  tags: text("tags").array(),
  views: integer("views").default(0),
  ...timestamps,
});

export const postsInsertSchema = createInsertSchema(posts, {
  title: z.string().min(1).max(255),
});
export const postsUpdateSchema = createUpdateSchema(posts);
export const postsSelectSchema = createSelectSchema(posts).omit({
  createdAt: true,
  updatedAt: true,
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  product: one(products, {
    fields: [posts.productId],
    references: [products.id],
  }),
  author: one(user, {
    fields: [posts.authorId],
    references: [user.id],
  }),
  comments: many(comments),
}));

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    content: text("content").notNull(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [
    foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
      name: "comments_parent_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
  parentId: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comments_parent_id_fkey",
  }),
  reactions: many(commentsReactions),
  replies: many(comments, {
    relationName: "comments_replies_fkey",
  }),
}));

export const commentsInsertSchema = createInsertSchema(comments);
export const commentsSelectSchema = createSelectSchema(comments);
export const commentsUpdateSchema = createUpdateSchema(comments);

export const reactionTypes = pgEnum("reaction_type", ["like", "dislike"]);

export const commentsReactions = pgTable(
  "comments_reactions",
  {
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),
    type: reactionTypes("type").notNull(),
    ...timestamps,
  },
  (t) => [
    primaryKey({
      name: "comments_reactions_pk",
      columns: [t.userId, t.commentId],
    }),
  ]
);

export const commentsReactionsRelations = relations(
  commentsReactions,
  ({ one }) => ({
    user: one(user, {
      fields: [commentsReactions.userId],
      references: [user.id],
    }),
    comment: one(comments, {
      fields: [commentsReactions.commentId],
      references: [comments.id],
    }),
  })
);

export const fileVisibility = pgEnum("file_visibility", ["public", "private"]);

/* Document Schema
 *  Document Table for firmware, drivers, and utilities
 */

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    version: text("version"),
    releaseDate: timestamp("release_date"),
    fileSize: text("file_size"),
    fileType: text("file_type"),
    fileKey: text("file_key"),
    visibility: fileVisibility("visibility").default("private").notNull(),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    ...timestamps,
  },
  (t) => [
    foreignKey({
      name: "documents_product_id_fkey",
      columns: [t.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
  ]
);

export const documentsInsertSchema = createInsertSchema(documents, {
  name: z.string().min(1).max(255),
  productId: z.string().uuid(),
});
export const documentsSelectSchema = createSelectSchema(documents).omit({
  createdAt: true,
  updatedAt: true,
});
export const documentsUpdateSchema = createUpdateSchema(documents);

export const documentsRelations = relations(documents, ({ one }) => ({
  product: one(products, {
    fields: [documents.productId],
    references: [products.id],
  }),
}));

/* Download Schema
 *  Download Table for firmware, drivers, and utilities
 */

export const downloads = pgTable(
  "downloads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    version: text("version"),
    releaseDate: timestamp("release_date"),
    operatingSystem: text("operating_system"),
    architecture: text("architecture"),
    fileSize: text("file_size"),
    fileType: text("file_type"),
    fileKey: text("file_key"),
    downloadCount: integer("download_count").default(0),
    checksumMd5: text("checksum_md5"),
    checksumSha256: text("checksum_sha256"),
    installationNotes: text("installation_notes"),
    visibility: fileVisibility("visibility").default("private").notNull(),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    ...timestamps,
  },
  (t) => [
    foreignKey({
      name: "downloads_product_id_fkey",
      columns: [t.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
  ]
);

export const downloadsInsertSchema = createInsertSchema(downloads, {
  name: z.string().min(1).max(255),
  productId: z.string().uuid(),
});
export const downloadsSelectSchema = createSelectSchema(downloads).omit({
  createdAt: true,
  updatedAt: true,
});
export const downloadsUpdateSchema = createUpdateSchema(downloads);

export const downloadsRelations = relations(downloads, ({ one }) => ({
  product: one(products, {
    fields: [downloads.productId],
    references: [products.id],
  }),
}));

export const saveProduct = pgTable(
  "save_product",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [
    primaryKey({
      name: "save_product_pk",
      columns: [t.userId, t.productId],
    }),
  ]
);

export const saveProductRelations = relations(saveProduct, ({ one }) => ({
  user: one(user, {
    fields: [saveProduct.userId],
    references: [user.id],
  }),
  product: one(products, {
    fields: [saveProduct.productId],
    references: [products.id],
  }),
}));
