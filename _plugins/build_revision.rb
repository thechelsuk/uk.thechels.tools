# Makes the commit being built available as `site.build_revision`
# (like site.github.build_revision, without needing the GitHub API).
# CI sets GITHUB_SHA; local builds ask git.
Jekyll::Hooks.register :site, :after_init do |site|
  sha = ENV["GITHUB_SHA"].to_s.strip
  sha = `git rev-parse HEAD 2>/dev/null`.strip if sha.empty?
  site.config["build_revision"] = sha unless sha.empty?
end
