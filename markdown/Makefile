MD_SUBDIRS := $(wildcard */)
EJS_SUBDIRS := $(addprefix ../views/compiled/,$(MD_SUBDIRS))
MD_FILES := $(wildcard $(addsuffix *.md,$(MD_SUBDIRS)))
EJS_FILES := $(patsubst %.md, ../views/compiled/%.ejs, $(MD_FILES))

vpath %.md $(MD_SUBDIRS)
vpath %.ejs $(EJS_SUBDIRS)
vpath %.rb ../scripts/
vpath %.sh ../scripts/

all: $(EJS_SUBDIRS) $(EJS_FILES)

$(EJS_SUBDIRS):
	mkdir -p $@

$(EJS_FILES): ../views/compiled/%.ejs: %.md page_generator.rb md_to_html.sh
	../scripts/md_to_html.sh $< $@

clean:
	-rm -rf ../views/compiled