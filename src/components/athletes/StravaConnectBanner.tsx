export default function StravaConnectBanner() {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-orange-200 dark:border-orange-400/20 bg-orange-50 dark:bg-orange-900/10 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-orange-900">Connect your Strava account</p>
        <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
          Link Strava so your runs automatically sync to athlete profiles.
        </p>
      </div>
      <a
        href="/strava/consent"
        className="shrink-0 active:scale-[0.97] transition-transform duration-150"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Strava brand asset must not be altered */}
        <img
          src="/assets/strava/btn_strava_connect_with_orange.png"
          srcSet="/assets/strava/btn_strava_connect_with_orange.png 1x, /assets/strava/btn_strava_connect_with_orange_x2.png 2x"
          alt="Connect with Strava"
          width={193}
          height={48}
          className="block max-h-[48px] w-auto"
        />
      </a>
    </div>
  )
}
