import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

// const CENTERED_COMPONENTS = [
//     "AiSearchBar",
   
// ];


export default async function PreviewPage({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;
    if (!slug.length) return notFound();

    const componentName = slug.join("/");

    try {
        const Component = dynamic(
            () =>
                import(`@/components/LY UI/AI/${componentName}`).catch(() =>
                    notFound()
                ),
            { ssr: true }
        );


   

        return (
            <div className="min-h-screen w-full flex items-center justify-center">
                <Component />
            </div>
        ) 
    } catch (error) {
        return notFound();
    }
}
