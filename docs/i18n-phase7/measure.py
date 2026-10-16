# Run from the repository root: python3 docs/i18n-phase7/measure.py /absolute/path/to/baseline
import pathlib,subprocess,time,json,platform,statistics,sys
repo=pathlib.Path.cwd(); base=pathlib.Path(sys.argv[1]).resolve()
def size(p):
 fs=[f for f in p.rglob('*') if f.is_file()]
 return {'files':len(fs),'bytes':sum(f.stat().st_size for f in fs)}
result={'baselineRef':'df5526d','currentRef':'cc47eed + phase7 + complete Italian content','platform':platform.platform(),'node':subprocess.check_output(['node','--version'],text=True).strip(),'pnpm':subprocess.check_output(['pnpm','--version'],text=True).strip(),'method':'Same installed dependencies via symlinks; sequential warm runs, no install/network; logical bytes; pnpm build includes generation. Alternating baseline/current, three repetitions.'}
for label,root in [('baseline',base),('current',repo)]:
 result[label]={'generationSeconds':[],'buildSeconds':[]}
 # warm up each build, including dependencies/cache and generated output
 with open(repo/f'docs/i18n-phase7/logs/perf-{label}-warm.log','w') as f:
  p=subprocess.run(['pnpm','build'],cwd=root,stdout=f,stderr=subprocess.STDOUT)
 if p.returncode:raise RuntimeError(label+' warm build failed')
for i in range(3):
 for label,root in [('baseline',base),('current',repo)]:
  for kind,cmd in [('generationSeconds',['pnpm','generate:content']),('buildSeconds',['pnpm','build'])]:
   start=time.perf_counter()
   with open(repo/f'docs/i18n-phase7/logs/perf-{label}-{i}-{kind}.log','w') as f:
    p=subprocess.run(cmd,cwd=root,stdout=f,stderr=subprocess.STDOUT)
   if p.returncode:raise RuntimeError(label+' '+kind+' failed')
   result[label][kind].append(round(time.perf_counter()-start,4))
  print(label,i,result[label],flush=True)
for label,root in [('baseline',base),('current',repo)]:
 for kind in ['generationSeconds','buildSeconds']:result[label][kind+'Median']=statistics.median(result[label][kind])
 result[label]['generated']=size(root/'apps/web/public/generated')
 result[label]['dist']=size(root/'apps/web/dist')
 result[label]['assets']=size(root/'apps/web/dist/assets')
 result[label]['groups']={}
 gen=root/'apps/web/public/generated'
 for name in ['catalog.json','scores','en/catalog.json','en/scores','it/catalog.json','it/scores','i18n-coverage.json']:
  p=gen/name
  if p.is_file(): result[label]['groups'][name]={'files':1,'bytes':p.stat().st_size}
  elif p.is_dir():result[label]['groups'][name]=size(p)
(repo/'docs/i18n-phase7/performance.json').write_text(json.dumps(result,indent=2)+'\n')
