import { Tag } from "@markdoc/markdoc";
import { Divider } from "@mui/joy";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import React from "react";
import AuthorView from "@/components/AuthorView";
import ContentRender from "@/components/ContentRender";
import Icon from "@/components/Icon";
import TableOfContent from "@/components/TableOfContent";
import authorList, { Author } from "@/consts/author";
import { getBlogSlugList, getFilePathFromSlugs, readFileContenxt } from "@/lib/content";
import { markdoc } from "@/markdoc/markdoc";
import { getMetadata } from "@/utils/metadata";

const Subscription = dynamic(() => import("@/components/Subscription"), {
  ssr: false,
});

interface Props {
  params: { slug: string };
}

const Page = ({ params }: Props) => {
  const filePath = getFilePathFromSlugs("blog", params.slug.split("/"));
  const content = readFileContenxt(filePath);
  if (!content) {
    return notFound();
  }

  const { frontmatter, transformedContent } = markdoc(content);
  const author = authorList.find((author) => author.name === frontmatter.author) as Author;
  if (!transformedContent || !(transformedContent instanceof Tag)) {
    return null;
  }

  const children = transformedContent.children;
  const headings = JSON.parse(
    JSON.stringify(children.filter((child) => child instanceof Tag && (child.name === "h2" || child.name === "h3"))),
  ) as Tag[];

  return (
    <div className="w-full">
      <div className="w-full sm:px-6">
        {frontmatter.feature_image && (
          <div className="w-full mb-6 sm:mb-12">
            <img className="w-full max-w-lg h-auto mx-auto rounded-lg" src={frontmatter.feature_image} alt="" />
          </div>
        )}
        <h1 className="w-full text-3xl sm:text-5xl font-medium sm:font-bold mt-4 sm:text-center">{frontmatter.title}</h1>
        <div className="mt-4 w-full flex flex-row justify-start sm:justify-center items-center">
          <span className="text-gray-500">{frontmatter.published_at}</span>
          <Icon.Dot className="w-4 h-auto mx-1 text-gray-400" />
          <AuthorView author={author} />
        </div>
      </div>
      <div className="w-full flex flex-row justify-start items-start sm:mt-8">
        <div className="w-full md:max-w-[calc(100%-16rem)] sm:px-6">
          <ContentRender markdocNode={transformedContent} />
          <Divider className="!my-12" />
          <Subscription />
        </div>
        <div className="hidden lg:block sticky top-24 h-[calc(100svh-6rem)] w-64 shrink-0">
          <div className="relative w-full h-full overflow-auto py-4 no-scrollbar">
            <TableOfContent headings={headings} />
          </div>
          <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-t from-transparent to-zinc-100"></div>
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-transparent to-zinc-100"></div>
        </div>
      </div>
    </div>
  );
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const filePath = getFilePathFromSlugs("blog", params.slug.split("/"));
  const content = readFileContenxt(filePath);
  if (!content) {
    return notFound();
  }

  const { frontmatter } = markdoc(content);
  return getMetadata({
    title: frontmatter.title + " - Memos",
    pathname: `/blog/${params.slug}`,
    description: frontmatter.description,
    imagePath: frontmatter.feature_image,
  });
};

export const generateStaticParams = () => {
  return getBlogSlugList().map((contentSlug) => {
    return { slug: contentSlug };
  });
};

export default Page;
