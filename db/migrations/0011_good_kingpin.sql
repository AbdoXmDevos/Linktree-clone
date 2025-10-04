CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(7),
	"icon" varchar(50),
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "link_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" uuid NOT NULL,
	"event_type" varchar(20) NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now(),
	"user_agent" text,
	"referrer" text,
	"ip_address" "inet",
	"country_code" varchar(2),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "category" varchar(50);--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "custom_styling" jsonb;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "is_featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "theme" varchar(10) DEFAULT 'light';--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "customization" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "analytics_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_analytics" ADD CONSTRAINT "link_analytics_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;