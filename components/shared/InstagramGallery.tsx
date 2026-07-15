import { Container } from "@/components/layout/Container";
import { AspectImage } from "@/components/shared/AspectImage";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { socialLinks } from "@/constants/config";

interface InstagramGalleryProps {
  images: string[];
  title?: string;
  instagramUrl?: string;
  instagramUsername?: string;
}

export function InstagramGallery({
  images,
  title = "Follow Our Style",
  instagramUrl = socialLinks.instagram.url,
  instagramUsername = socialLinks.instagram.username,
}: InstagramGalleryProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal className="mb-10 flex flex-col items-center gap-2 text-center sm:mb-12">
          <h2 className="bg-gradient-to-r from-blush-deep via-blush-deep-hover to-blush-deep bg-clip-text text-3xl font-bold tracking-tight text-transparent [text-shadow:_0_1px_3px_rgb(255_255_255_/_70%)] sm:text-[32px]">
            {title}
          </h2>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/handle flex items-center gap-2 text-base font-semibold text-blush-deep transition-colors duration-[250ms] hover:text-text-primary"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-blush-light text-blush-deep transition-transform duration-[250ms] group-hover/handle:scale-110">
              <InstagramIcon className="size-4.5" />
            </span>
            @{instagramUsername}
          </a>
        </Reveal>

        {images.length === 0 ? (
          <p className="text-center text-sm text-text-muted">More photos coming soon.</p>
        ) : (
          <Reveal stagger className="grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-6">
            {images.map((image, index) => (
              <RevealItem key={image}>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block rounded-image shadow-soft transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_0_0_4px_rgb(245_212_220_/_0.5),0_18px_36px_-10px_rgb(239_198_209_/_0.55)]"
                >
                  <AspectImage
                    src={image}
                    alt={`MoonKart on Instagram ${index + 1}`}
                    ratio="square"
                    rounded="rounded-image"
                    imageClassName="transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.1]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center rounded-image bg-text-primary/0 opacity-0 transition-all duration-[350ms] ease-out group-hover:bg-text-primary/30 group-hover:opacity-100"
                  >
                    <InstagramIcon className="size-6 scale-75 text-white opacity-0 transition-all duration-[350ms] delay-[50ms] ease-out group-hover:scale-100 group-hover:opacity-100" />
                  </div>
                </a>
              </RevealItem>
            ))}
          </Reveal>
        )}
      </Container>
    </section>
  );
}
