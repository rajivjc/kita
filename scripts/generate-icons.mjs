import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Modern runner icon — built from thick overlapping rounded segments
// that merge into a solid, silhouette-like figure. Each limb has
// upper + lower segments with bends at elbows/knees for realism.
// Joint circles smooth transitions between body parts.
const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14B8A6"/>
      <stop offset="100%" stop-color="#0D9488"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>

  <!-- Runner silhouette — thick segments + joint circles = solid look -->
  <g fill="white" stroke="white" stroke-linecap="round" stroke-linejoin="round">

    <!-- Head -->
    <circle cx="312" cy="135" r="32" stroke="none"/>

    <!-- Torso (neck → hip, strong forward lean) -->
    <line x1="298" y1="167" x2="252" y2="280" stroke-width="42"/>

    <!-- Shoulder joint -->
    <circle cx="290" cy="193" r="16" stroke="none"/>
    <!-- Hip joint -->
    <circle cx="255" cy="276" r="15" stroke="none"/>

    <!-- ─── Front arm (reaching forward-right) ─── -->
    <line x1="290" y1="193" x2="342" y2="208" stroke-width="22"/>
    <circle cx="342" cy="208" r="9" stroke="none"/>
    <line x1="342" y1="208" x2="354" y2="178" stroke-width="18"/>

    <!-- ─── Back arm (swinging back-left) ─── -->
    <line x1="290" y1="193" x2="243" y2="174" stroke-width="22"/>
    <circle cx="243" cy="174" r="9" stroke="none"/>
    <line x1="243" y1="174" x2="218" y2="190" stroke-width="18"/>

    <!-- ─── Front leg (striding forward-right) ─── -->
    <line x1="255" y1="276" x2="318" y2="338" stroke-width="28"/>
    <circle cx="318" cy="338" r="11" stroke="none"/>
    <line x1="318" y1="338" x2="354" y2="320" stroke-width="23"/>

    <!-- ─── Back leg (pushing off back-left) ─── -->
    <line x1="255" y1="276" x2="198" y2="342" stroke-width="28"/>
    <circle cx="198" cy="342" r="11" stroke="none"/>
    <line x1="198" y1="342" x2="166" y2="365" stroke-width="23"/>
  </g>

  <!-- Motion lines (behind the runner) -->
  <g stroke="rgba(255,255,255,0.3)" stroke-width="5.5" stroke-linecap="round">
    <line x1="118" y1="225" x2="162" y2="225"/>
    <line x1="105" y1="258" x2="158" y2="258"/>
    <line x1="118" y1="291" x2="162" y2="291"/>
  </g>
</svg>`

async function generateIcons() {
  const publicDir = join(__dirname, '..', 'public')

  for (const size of [512, 192]) {
    const pngBuffer = await sharp(Buffer.from(iconSvg))
      .resize(size, size)
      .png()
      .toBuffer()
    const outputPath = join(publicDir, `icon-${size}.png`)
    writeFileSync(outputPath, pngBuffer)
    console.log(`Generated icon-${size}.png (${pngBuffer.length} bytes)`)
  }

  console.log('Done!')
}

generateIcons().catch(err => { console.error(err); process.exit(1) })
